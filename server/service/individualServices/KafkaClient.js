const LayerProtocol = require('onf-core-model-ap/applicationPattern/onfModel/models/LayerProtocol');
const controlConstruct = require('onf-core-model-ap/applicationPattern/onfModel/models/ControlConstruct');
const onfAttributes = require('onf-core-model-ap/applicationPattern/onfModel/constants/OnfAttributes');
const TcpClientInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/TcpClientInterface');
const kafka = require("onf-core-model-ap/applicationPattern/services/KafkaConsumerService");

const { Kafka } = require("kafkajs");
const process = require('process');
const configConstants = require('./ConfigConstants');
const notificationManagement = require("./NotificationManagement");

const clientId = "backup-and-restore";
const brokers = [process.env['KAFKA_BROKER'] || "localhost:9092"]; // Default to localhost if not set

let consumer = null;

exports.connect = async function () {
  const groupId = `backup-and-restore-consumer-group`;

  const kafka = new Kafka({
    clientId,
    brokers,
  });

  consumer = kafka.consumer({ groupId, sessionTimeout: 45000 });
  await consumer.connect();

  console.info(
    `Kafka consumer connected to brokers: ${brokers.join(", ")} with groupId: ${groupId}`
  );
};

exports.getKafkaClient = async function () {
    try {
        let ltpListForKafkaClient = await controlConstruct.getLogicalTerminationPointListAsync(LayerProtocol.layerProtocolNameEnum.KAFKA_CLIENT);
        let ltpForKafkaClient = ltpListForKafkaClient[0];
        return ltpForKafkaClient;
    } catch (error) {
        console.log(error);
        return undefined;
    }
}

exports.getKafkaGroupId = async function (kafkaClientLtp) {
    try {
        let kafkaConfig = kafkaClientLtp[onfAttributes.LOGICAL_TERMINATION_POINT.LAYER_PROTOCOL][0][onfAttributes.LAYER_PROTOCOL.KAFKA_CLIENT_INTERFACE_PAC][onfAttributes.KAFKA_CLIENT.CONFIGURATION];
        let groupId = kafkaConfig[onfAttributes.KAFKA_CLIENT.GROUP_ID];
        return groupId;
    } catch (error) {
        console.log(error);
        return undefined;
    }
}

exports.getKafkaTopicName = async function (kafkaClientLtpList) {
    let topics = [];
    try {
        for (let index = 0; index < kafkaClientLtpList.length; index++) {
            const kafkaClientLtp = kafkaClientLtpList[index];
            let kafkaConfig = kafkaClientLtp[onfAttributes.LOGICAL_TERMINATION_POINT.LAYER_PROTOCOL][0][onfAttributes.LAYER_PROTOCOL.KAFKA_CLIENT_INTERFACE_PAC][onfAttributes.KAFKA_CLIENT.CONFIGURATION];
            let topicName = kafkaConfig[onfAttributes.KAFKA_CLIENT.TOPIC_NAME];
            topics.push(topicName);
        }
        return topics;
    } catch (error) {
        console.log(error);
        return undefined;
    }
}
exports.getKafkaClientId = async function (kafkaClientLtp) {
    try {
        let kafkaConfig = kafkaClientLtp[onfAttributes.LOGICAL_TERMINATION_POINT.LAYER_PROTOCOL][0][onfAttributes.LAYER_PROTOCOL.KAFKA_CLIENT_INTERFACE_PAC][onfAttributes.KAFKA_CLIENT.CONFIGURATION];
        let clientId = kafkaConfig[onfAttributes.KAFKA_CLIENT.CLIENT_ID];
        return clientId;
    } catch (error) {
        console.log(error);
        return undefined;
    }
}

exports.getBrokerForKafka = async function (kafkaClientLtp) {
    try {
        let broker = "";
        let kafkaHttpClientLtpUuid = kafkaClientLtp[onfAttributes.LOGICAL_TERMINATION_POINT.SERVER_LTP][0];
        let kafkaHttpClientLtp = await controlConstruct.getLogicalTerminationPointAsync(kafkaHttpClientLtpUuid);
        let kafkaTcpClientLtpUuid = kafkaHttpClientLtp[onfAttributes.LOGICAL_TERMINATION_POINT.SERVER_LTP][0];
        let remoteAddress = await TcpClientInterface.getRemoteAddressAsync(kafkaTcpClientLtpUuid);
        let address = "";
        if (remoteAddress.hasOwnProperty(onfAttributes.TCP_CLIENT.IP_ADDRESS)) {
            address = remoteAddress[onfAttributes.TCP_CLIENT.IP_ADDRESS][onfAttributes.TCP_CLIENT.IPV_4_ADDRESS];
        } else if (remoteAddress.hasOwnProperty(onfAttributes.TCP_CLIENT.DOMAIN_NAME)) {
            address = remoteAddress[onfAttributes.TCP_CLIENT.DOMAIN_NAME];
        }
        let remotePort = await TcpClientInterface.getRemotePortAsync(kafkaTcpClientLtpUuid);
        broker = address + ":" + remotePort;
        return broker;
    } catch (error) {
        console.log(error);
        return [];
    }
}

exports.getKafkaClientList = async function () {
    try {
        let ltpListForKafkaClientList = await controlConstruct.getLogicalTerminationPointListAsync(LayerProtocol.layerProtocolNameEnum.KAFKA_CLIENT);
        return ltpListForKafkaClientList;
    } catch (error) {
        console.log(error);
        return [];
    }
}

exports.connectToKafka = async function () {
  try {
    let ltpForKafkaClient = await exports.getKafkaClient();
    let groupId = await exports.getKafkaGroupId(ltpForKafkaClient);
    let clientId = await exports.getKafkaClientId(ltpForKafkaClient);
    let brokerList = [].concat(await exports.getBrokerForKafka(ltpForKafkaClient));
    let kafkaClientList = await exports.getKafkaClientList();
    let topics = await exports.getKafkaTopicName(kafkaClientList);
    consumer = await kafka.connect(groupId, clientId, brokerList);
    if(consumer) {
      exports.subscribe(topics);
    }
  } catch (error) {
    console.log(error);
    console.error("Error in starting Kafka worker:", error);
  }
};

exports.subscribe = async function (topics) {
  if (!consumer) {
    console.error("Kafka consumer is not connected. Call connect() first.");
    return;
  }
  try {
    await consumer.subscribe({ topics });
    console.info(`Subscribed to topics: ${topics.join(", ")}`);
    await consumer.run({
      eachMessage: async ({ topic, partition, message, heartbeat }) => {
        try {
          // 1) Null/empty guard: value can be null
          if (!message.value || message.value.length === 0) {
            await heartbeat();
            console.debug(
              `Skipping empty message at ${topic}[${partition}] offset=${message.offset}`
            );
            return;
          }
          const rawMsg = message.value.toString("utf8");

          // 3) Safe JSON.parse()
          let notification;
          try {
            notification = JSON.parse(rawMsg);
          } catch (e) {
            console.warn(
              `Invalid JSON at ${topic}[${partition}] offset=${message.offset}: ${e.message}`
            );
            await heartbeat();
            return; // skip bad message
          }

          // 4) Derive notification type safely
          const keys = Object.keys(notification);
          if (keys.length === 0) {
            await heartbeat();
            return;
          }

          const inboundNotificationTypeRaw = keys[0] || "";
          let subscriberNotificationType = null;

          if (inboundNotificationTypeRaw.includes("attribute-value-changed-notification")) {
            subscriberNotificationType = configConstants.DEVICE_ATTR_VALUE_CHANGES;
          }
          // Add other mappings here:
          // else if (inboundNotificationTypeRaw.includes("device-object-creation")) { ... }
          // else if (inboundNotificationTypeRaw.includes("device-object-deletion")) { ... }
          // else if (inboundNotificationTypeRaw.includes("device-alarm")) { ... }

          // 5) Only call enrichment if we actually have a mapped type
          if (subscriberNotificationType) {
            await notificationManagement.enrichMessageForEs(
              subscriberNotificationType,
              notification
            );
          } else {
            // Unknown notification type
            console.debug(
              `Unknown notification type "${inboundNotificationTypeRaw}" at ${topic}[${partition}] offset=${message.offset}`
            );
          }

          // 6) Heartbeat periodically if work can be slow
          await heartbeat();

          // Optional: structured log for observability (avoid toString() on nulls)
          console.log({
            topic,
            partition,
            offset: message.offset,
            // value: rawMsg,
          });
        } catch (err) {
          // Catch-all so a single bad record never tears down the consumer
          console.error(
            `eachMessage handler error at ${topic}[${partition}] offset=${message?.offset}`,
            err
          );
        }
      },
    });
  } catch (error) {
    console.error(`Error subscribing to topics: ${error}`);
  }
};
