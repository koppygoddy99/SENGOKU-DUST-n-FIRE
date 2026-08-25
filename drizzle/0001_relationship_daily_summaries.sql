CREATE TABLE `relationshipDailySummaries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`campaignId` varchar(120) NOT NULL,
	`contactId` varchar(32) NOT NULL,
	`inGameDay` int NOT NULL,
	`sourceHash` varchar(64) NOT NULL,
	`analysisVersion` varchar(40) NOT NULL,
	`evidenceJson` text NOT NULL,
	`publicSummaryJson` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `relationshipDailySummaries_id` PRIMARY KEY(`id`),
	CONSTRAINT `relationship_summary_source_unique` UNIQUE(`ownerId`,`campaignId`,`contactId`,`inGameDay`,`sourceHash`)
);
