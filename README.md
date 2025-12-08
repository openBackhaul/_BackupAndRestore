# _BackupAndRestore

The system periodically creates configuration backups for network devices and stores them in the database, enabling quick recovery in case of failures, misconfigurations, or disasters. It also provides features like backup scheduling, retention policies (e.g., storing the last few backups).
The restore process allows operators to revert a device to its last known good configuration, but it is typically service-affecting and performed on a single device at a time to minimize risk.

### Driver  
Replacement of ComarchOSS  

### Scope
The current Backup and Restore Management is to be replaced by a set of microservices for implementing autonomous backup management of config data and an open-source tool for managing restore operations.
 
The following scope is currently discussed between the ToolStream (consumers) and the InterfaceStream (MW SDN domain) for Backup and Restore Management project:
- Implement a Backup scheduler to create backup tasks for multiple active devices, along with a task window for monitoring scheduled backup jobs.
-	Retain the last five configuration backups per device in the database, storing only configuration files.
-	Provide a backup export option for downloading and sharing backup files.
-	Enable integration for storing backups in an external repository by sharing connectivity details.
-	Ensure restore process is service-affecting and limited to a single device at a time, using the latest configuration backup.
-	Capture restore process activation through device login.
-	Bulk Backup can be performed based on Model
-	Job Manager for handling restore process
-	Handling Remote SSH server configuration
-	Device level notification Log with execution and trace logs
-	User specific tracking Transaction logs for audit purpose

### Out of Scope
-	Manual backup and restore operations.
-	Support for non-SDN devices.
-	Any enhancements outside MW SDN domain integration.

### Detailed Requirements
See [detailed list of requirements](../../issues) in the issues section.  

### Components
The following components are required for implementing the _BackupAndRestore UserDemand:
- _to be designed_

### New Applications:
-	Microservice-based Backup Management System.
-	User Interface for BackupAndRestore Management, Task Scheduler.

### To be Updated Applications:
-	MicroWaveDeviceInventory.
-	MicroWaveDeviceGatekeeper.

### Dependencies on On-going Implementations:
-	SDN Controller integration for device status and parameter sync.
-	Planning Tool integration for onboarding device data.
-	External repository connectivity for backup storage.
