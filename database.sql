-- MySQL dump 10.13  Distrib 9.1.0, for Win64 (x86_64)
--
-- Host: localhost    Database: myclinique_db
-- ------------------------------------------------------
-- Server version	9.1.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `appointment`
--

DROP TABLE IF EXISTS `appointment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `appointment` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `patientId` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `doctorId` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `appointmentDate` datetime(3) NOT NULL,
  `startTime` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `endTime` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('PENDING','CONFIRMED','IN_PROGRESS','COMPLETED','CANCELLED','NO_SHOW') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Appointment_patientId_idx` (`patientId`),
  KEY `Appointment_status_idx` (`status`),
  KEY `Appointment_doctorId_idx` (`doctorId`),
  KEY `Appointment_appointmentDate_idx` (`appointmentDate`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointment`
--

LOCK TABLES `appointment` WRITE;
/*!40000 ALTER TABLE `appointment` DISABLE KEYS */;
INSERT INTO `appointment` VALUES ('0805b610-1b64-4fc4-9013-9dd7f8d18a18','ddd25c0b-db5e-442b-9df0-20895449b9d6','7a2be79f-448c-455e-ae0d-4c99e51804e9','2026-09-17 08:15:22.926','16:15','16:45','PENDING','Contrôle glycémie et ajustement du traitement antidiabétique','Patient invité à se présenter 10 minutes avant l’heure.','2026-09-17 08:15:22.952','2026-09-17 08:15:22.952'),('09a6c05a-2f9d-4f6f-9c12-ca1d87f9638a','268c7b61-5dd6-402a-ae66-ff4bf2df3461','46d5d44b-5b92-4c20-9d40-c599448c263a','2026-09-17 08:15:22.926','14:00','14:00','PENDING','Éruption cutanée prurigineuse au niveau du tronc','Patient invité à se présenter 10 minutes avant l’heure.','2026-09-17 08:15:22.946','2026-09-17 08:15:22.946'),('16998135-c207-45e4-a724-3cd6da95a1a0','25b45779-9f14-46e1-aaf3-aaab9ec5616d','7a2be79f-448c-455e-ae0d-4c99e51804e9','2026-09-17 08:15:22.926','10:00','10:00','CONFIRMED','Fièvre persistante depuis 48h avec céphalées vives','Patient invité à se présenter 10 minutes avant l’heure.','2026-09-17 08:15:22.943','2026-09-17 08:15:22.943'),('45451514-da3a-40b6-997c-987aabbb6f97','944bf2ae-12ef-4a7f-b083-815a51a7e3ab','a7a44e6c-e0cc-455c-9303-f5451d71a41a','2026-09-17 08:15:22.926','14:45','14:45','CANCELLED','Renouvellement traitement antihypertenseur et contrôle tensionnel','Patient invité à se présenter 10 minutes avant l’heure.','2026-09-17 08:15:22.948','2026-09-17 08:41:27.676'),('5e20773e-da54-4fd9-8155-41e5e77cb442','97ea7c7c-6c1b-46c0-897b-f4a938ca9bce','a7a44e6c-e0cc-455c-9303-f5451d71a41a','2026-09-17 08:15:22.926','08:30','08:00','COMPLETED','Consultation de routine et bilan de santé annuel','Patient invité à se présenter 10 minutes avant l’heure.','2026-09-17 08:15:22.940','2026-09-17 08:15:22.940'),('a3e52e83-5ef0-4ad5-beda-2077eaa74d45','df9627af-c2be-4ccf-888e-d6f8a1064ef9','d4c4a47f-31e8-45a0-894d-d40353d7e3dd','2026-09-17 08:15:22.926','11:00','11:00','CONFIRMED','Suivi mensuel de grossesse et échographie obstétricale','Patient invité à se présenter 10 minutes avant l’heure.','2026-09-17 08:15:22.945','2026-09-17 08:15:22.945'),('a54fe598-8f43-4027-a2e2-c6778c8ec625','08d1364a-d211-49f2-b6dc-17ab147312d3','c3fffe6c-5c60-4d61-b211-0cd45ef335c5','2026-09-17 08:15:22.926','15:30','45:00','PENDING','Bilan pédiatrique des 3 ans et mise à jour vaccinale','Patient invité à se présenter 10 minutes avant l’heure.','2026-09-17 08:15:22.950','2026-09-17 08:15:22.950'),('dda6be32-398c-473b-8c9b-6b11d8d41ee7','394da908-e5a9-47c8-a62a-4c178b746d08','c3fffe6c-5c60-4d61-b211-0cd45ef335c5','2026-09-17 08:15:22.926','09:15','09:45','IN_PROGRESS','Douleurs thoraciques atypiques et essoufflement à l’effort','Patient invité à se présenter 10 minutes avant l’heure.','2026-09-17 08:15:22.942','2026-09-17 08:15:22.942');
/*!40000 ALTER TABLE `appointment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auditlog`
--

DROP TABLE IF EXISTS `auditlog`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auditlog` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `clinicId` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `action` enum('LOGIN','LOGOUT','CREATE','UPDATE','DELETE','DISPENSE','PAYMENT') COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entityId` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `details` text COLLATE utf8mb4_unicode_ci,
  `ipAddress` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `userAgent` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `AuditLog_clinicId_idx` (`clinicId`),
  KEY `AuditLog_entity_idx` (`entity`),
  KEY `AuditLog_createdAt_idx` (`createdAt`),
  KEY `AuditLog_userId_fkey` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auditlog`
--

LOCK TABLES `auditlog` WRITE;
/*!40000 ALTER TABLE `auditlog` DISABLE KEYS */;
INSERT INTO `auditlog` VALUES ('003a7d1f-ca9f-4708-a304-dff90e9da494','78807ce9-93ad-4771-89b8-88d153b24caf','3f42c72f-72c4-40c7-ba8a-7d011b49ec8f','LOGIN','User','3f42c72f-72c4-40c7-ba8a-7d011b49ec8f','Connexion réussie de Fanja Rabary (Réceptionniste)','127.0.0.1','My Clinique Client App','2026-09-17 08:37:26.324'),('04c0d9df-f306-4c57-aa94-fc8083ba86f0','78807ce9-93ad-4771-89b8-88d153b24caf','6661fa07-e61e-47cc-be9c-a0ef8d8e28a6','LOGIN','User','6661fa07-e61e-47cc-be9c-a0ef8d8e28a6','Connexion réussie de Jean Dupont (Médecin Praticien)','127.0.0.1','My Clinique Client App','2026-09-17 08:48:58.767'),('0ded3e52-04c4-40e6-b834-42c51840f96d','78807ce9-93ad-4771-89b8-88d153b24caf','6661fa07-e61e-47cc-be9c-a0ef8d8e28a6','LOGIN','User','6661fa07-e61e-47cc-be9c-a0ef8d8e28a6','Connexion réussie de Jean Dupont (Médecin Praticien)','127.0.0.1','My Clinique Client App','2026-09-22 14:15:14.392'),('0ecefde7-3bc3-4c6c-8b6c-bc831872512d','78807ce9-93ad-4771-89b8-88d153b24caf','afa1413e-5d9c-4eb7-aba2-b3f137183908','LOGOUT','User','afa1413e-5d9c-4eb7-aba2-b3f137183908','Déconnexion de Alexandre Dumas','127.0.0.1','My Clinique Client App','2026-09-22 14:15:12.297'),('1491463b-479f-4772-a790-ac71a05ec467','78807ce9-93ad-4771-89b8-88d153b24caf','8970749f-92ff-4553-b2c6-e47e17253211','LOGOUT','User','8970749f-92ff-4553-b2c6-e47e17253211','Déconnexion de Tahina Randria','127.0.0.1','My Clinique Client App','2026-09-23 06:43:31.999'),('17aa91f0-44ee-4993-b59c-65d192b3057d','78807ce9-93ad-4771-89b8-88d153b24caf','afa1413e-5d9c-4eb7-aba2-b3f137183908','DELETE','Supplier','34c3a54e-9a55-486d-b481-a4b53c0a2438','Suppression du fournisseur Laboratoires Test BioPharma MODIFIÉ','127.0.0.1','My Clinique Client App','2026-09-23 12:41:00.172'),('1a1d581c-8ea4-451f-bd88-210df95afe20','78807ce9-93ad-4771-89b8-88d153b24caf','8970749f-92ff-4553-b2c6-e47e17253211','LOGOUT','User','8970749f-92ff-4553-b2c6-e47e17253211','Déconnexion de Tahina Randria','127.0.0.1','My Clinique Client App','2026-09-17 08:48:55.868'),('244ac182-8721-4b59-9150-a7dc1d1df695','78807ce9-93ad-4771-89b8-88d153b24caf','3f42c72f-72c4-40c7-ba8a-7d011b49ec8f','LOGOUT','User','3f42c72f-72c4-40c7-ba8a-7d011b49ec8f','Déconnexion de Fanja Rabary','127.0.0.1','My Clinique Client App','2026-09-17 08:38:12.511'),('27a494a8-7389-4ace-8e7e-cdc1b1ef9bb6','78807ce9-93ad-4771-89b8-88d153b24caf','afa1413e-5d9c-4eb7-aba2-b3f137183908','LOGIN','User','afa1413e-5d9c-4eb7-aba2-b3f137183908','Connexion réussie de Alexandre Dumas (Super Administrateur)','127.0.0.1','My Clinique Client App','2026-09-23 06:41:02.871'),('27a90147-fe32-42aa-9226-b1614e17ee02','78807ce9-93ad-4771-89b8-88d153b24caf','afa1413e-5d9c-4eb7-aba2-b3f137183908','LOGOUT','User','afa1413e-5d9c-4eb7-aba2-b3f137183908','Déconnexion de Alexandre Dumas','127.0.0.1','My Clinique Client App','2026-09-23 06:41:56.540'),('2b1c917d-44ae-4356-841b-49ce0bc729aa','78807ce9-93ad-4771-89b8-88d153b24caf','3f42c72f-72c4-40c7-ba8a-7d011b49ec8f','LOGIN','User','3f42c72f-72c4-40c7-ba8a-7d011b49ec8f','Connexion réussie de Fanja Rabary (Réceptionniste)','127.0.0.1','My Clinique Client App','2026-09-23 06:57:47.804'),('2c821b4f-ace2-4d14-9ef3-c7f25a248919','78807ce9-93ad-4771-89b8-88d153b24caf','6661fa07-e61e-47cc-be9c-a0ef8d8e28a6','LOGOUT','User','6661fa07-e61e-47cc-be9c-a0ef8d8e28a6','Déconnexion de Jean Dupont','127.0.0.1','My Clinique Client App','2026-09-18 06:50:11.352'),('34e5d0ca-f432-41a1-9be7-e202b35aaf64','78807ce9-93ad-4771-89b8-88d153b24caf','afa1413e-5d9c-4eb7-aba2-b3f137183908','LOGIN','User','afa1413e-5d9c-4eb7-aba2-b3f137183908','Connexion réussie de Alexandre Dumas (Super Administrateur)','127.0.0.1','My Clinique Client App','2026-09-23 12:40:53.995'),('39d1502a-fb96-4e4c-abe6-cf272fcc6242','78807ce9-93ad-4771-89b8-88d153b24caf','afa1413e-5d9c-4eb7-aba2-b3f137183908','LOGIN','User','afa1413e-5d9c-4eb7-aba2-b3f137183908','Connexion réussie de Alexandre Dumas (Super Administrateur)','127.0.0.1','My Clinique Client App','2026-10-08 16:51:59.440'),('3b1aecae-777e-4665-82f5-3a128735c1a4','78807ce9-93ad-4771-89b8-88d153b24caf','3f42c72f-72c4-40c7-ba8a-7d011b49ec8f','LOGIN','User','3f42c72f-72c4-40c7-ba8a-7d011b49ec8f','Connexion réussie de Fanja Rabary (Réceptionniste)','127.0.0.1','My Clinique Client App','2026-10-08 16:51:32.340'),('3b62313e-7375-4ed0-b8c3-c1d7f4ca5ca6','78807ce9-93ad-4771-89b8-88d153b24caf','6661fa07-e61e-47cc-be9c-a0ef8d8e28a6','LOGIN','User','6661fa07-e61e-47cc-be9c-a0ef8d8e28a6','Connexion réussie de Jean Dupont (Médecin Praticien)','127.0.0.1','My Clinique Client App','2026-09-23 07:08:31.863'),('465f05eb-078b-403a-b655-452392b46201','78807ce9-93ad-4771-89b8-88d153b24caf','6661fa07-e61e-47cc-be9c-a0ef8d8e28a6','DISPENSE','PharmacySale','ddca79d6-6898-4b8d-b55a-ddda8759f54e','Vente pharmacie VTE-2026-0004 effectuée pour un montant de 32000 Ar. Stock déduit automatiquement.','127.0.0.1','My Clinique Client App','2026-09-22 14:15:46.723'),('4778b27f-64a5-4cb3-9162-2af1a8a4afcf','78807ce9-93ad-4771-89b8-88d153b24caf','afa1413e-5d9c-4eb7-aba2-b3f137183908','UPDATE','Clinic','78807ce9-93ad-4771-89b8-88d153b24caf','Modification des paramètres de la clinique \"Clinique Médicale M-It\"','127.0.0.1','My Clinique Client App','2026-09-17 08:33:46.165'),('49163626-d08b-48e6-bd78-c31ee601b068','78807ce9-93ad-4771-89b8-88d153b24caf','afa1413e-5d9c-4eb7-aba2-b3f137183908','LOGIN','User','afa1413e-5d9c-4eb7-aba2-b3f137183908','Connexion réussie de Alexandre Dumas (Super Administrateur)','127.0.0.1','My Clinique Client App','2026-09-17 08:38:14.154'),('4e2843fd-6312-46af-9742-344122a7d64d','78807ce9-93ad-4771-89b8-88d153b24caf','6661fa07-e61e-47cc-be9c-a0ef8d8e28a6','LOGIN','User','6661fa07-e61e-47cc-be9c-a0ef8d8e28a6','Connexion réussie de Jean Dupont (Médecin Praticien)','127.0.0.1','My Clinique Client App','2026-09-17 08:41:07.932'),('5314c172-c5ff-48f8-8695-ee86ecbd0477','78807ce9-93ad-4771-89b8-88d153b24caf','3f42c72f-72c4-40c7-ba8a-7d011b49ec8f','LOGIN','User','3f42c72f-72c4-40c7-ba8a-7d011b49ec8f','Connexion réussie de Fanja Rabary (Réceptionniste)','127.0.0.1','My Clinique Client App','2026-09-23 06:59:59.726'),('56f71f38-a7c4-4b38-91e4-9def427b5678','78807ce9-93ad-4771-89b8-88d153b24caf','afa1413e-5d9c-4eb7-aba2-b3f137183908','DISPENSE','PharmacySale','91b43f70-765e-49c6-a9cf-6a017149ffe0','Vente pharmacie VTE-2026-0003 effectuée pour un montant de 12500 Ar. Stock déduit automatiquement.','127.0.0.1','My Clinique Client App','2026-09-22 14:14:46.974'),('5ed1ba5d-0bca-4840-ad27-a0884f11830a','78807ce9-93ad-4771-89b8-88d153b24caf','afa1413e-5d9c-4eb7-aba2-b3f137183908','LOGIN','User','afa1413e-5d9c-4eb7-aba2-b3f137183908','Connexion réussie de Alexandre Dumas (Super Administrateur)','127.0.0.1','My Clinique Client App','2026-09-23 06:58:28.624'),('5f4c6e9c-0a25-4fe9-b17c-1e6de8b08bc6','78807ce9-93ad-4771-89b8-88d153b24caf','6661fa07-e61e-47cc-be9c-a0ef8d8e28a6','LOGIN','User','6661fa07-e61e-47cc-be9c-a0ef8d8e28a6','Connexion réussie de Jean Dupont (Médecin Praticien)','127.0.0.1','My Clinique Client App','2026-09-23 07:00:12.948'),('5f8e3a52-b04b-4798-9899-c8e19237b1be','78807ce9-93ad-4771-89b8-88d153b24caf','afa1413e-5d9c-4eb7-aba2-b3f137183908','CREATE','Supplier','34c3a54e-9a55-486d-b481-a4b53c0a2438','Création du fournisseur pharmaceutique Laboratoires Test BioPharma (+261 34 00 111 22)','127.0.0.1','My Clinique Client App','2026-09-23 12:40:57.221'),('60a17b85-4c7c-4f0b-95e3-1c2f610cbe84','78807ce9-93ad-4771-89b8-88d153b24caf','6661fa07-e61e-47cc-be9c-a0ef8d8e28a6','LOGIN','User','6661fa07-e61e-47cc-be9c-a0ef8d8e28a6','Connexion réussie de Jean Dupont (Médecin Praticien)','127.0.0.1','My Clinique Client App','2026-09-23 06:43:33.317'),('6414ad00-8ba0-4e5c-98c3-2eb304aa3f49','78807ce9-93ad-4771-89b8-88d153b24caf','afa1413e-5d9c-4eb7-aba2-b3f137183908','LOGIN','User','afa1413e-5d9c-4eb7-aba2-b3f137183908','Connexion réussie de Alexandre Dumas (Super Administrateur)','127.0.0.1','My Clinique Client App','2026-09-17 08:32:37.875'),('64812fc6-ccde-4302-bf08-7e96a563a015','78807ce9-93ad-4771-89b8-88d153b24caf','8970749f-92ff-4553-b2c6-e47e17253211','LOGIN','User','8970749f-92ff-4553-b2c6-e47e17253211','Connexion réussie de Tahina Randria (Pharmacien)','127.0.0.1','My Clinique Client App','2026-09-17 08:45:42.975'),('6ba36b7a-36c2-46cf-9753-744e47b86785','78807ce9-93ad-4771-89b8-88d153b24caf','afa1413e-5d9c-4eb7-aba2-b3f137183908','UPDATE','Supplier','34c3a54e-9a55-486d-b481-a4b53c0a2438','Mise à jour du fournisseur Laboratoires Test BioPharma MODIFIÉ','127.0.0.1','My Clinique Client App','2026-09-23 12:40:59.901'),('6cee5453-392c-48d0-ba34-9e3f43ad187d','78807ce9-93ad-4771-89b8-88d153b24caf','3f42c72f-72c4-40c7-ba8a-7d011b49ec8f','LOGIN','User','3f42c72f-72c4-40c7-ba8a-7d011b49ec8f','Connexion réussie de Fanja Rabary (Réceptionniste)','127.0.0.1','My Clinique Client App','2026-09-23 06:41:58.554'),('6fd3d915-75d0-4d19-b19e-947136178bec','78807ce9-93ad-4771-89b8-88d153b24caf','6661fa07-e61e-47cc-be9c-a0ef8d8e28a6','LOGOUT','User','6661fa07-e61e-47cc-be9c-a0ef8d8e28a6','Déconnexion de Jean Dupont','127.0.0.1','My Clinique Client App','2026-09-23 06:41:00.841'),('72cbcfd7-194a-48be-be05-243ca4f15ebe','78807ce9-93ad-4771-89b8-88d153b24caf','8970749f-92ff-4553-b2c6-e47e17253211','LOGIN','User','8970749f-92ff-4553-b2c6-e47e17253211','Connexion réussie de Tahina Randria (Pharmacien)','127.0.0.1','My Clinique Client App','2026-09-23 12:41:00.687'),('76ed5640-b097-470d-839c-d04bb53f4173','78807ce9-93ad-4771-89b8-88d153b24caf','afa1413e-5d9c-4eb7-aba2-b3f137183908','LOGIN','User','afa1413e-5d9c-4eb7-aba2-b3f137183908','Connexion réussie de Alexandre Dumas (Super Administrateur)','127.0.0.1','My Clinique Client App','2026-09-22 13:41:35.246'),('7798bbb8-0166-47a9-8047-d11ffbfbf115','78807ce9-93ad-4771-89b8-88d153b24caf','afa1413e-5d9c-4eb7-aba2-b3f137183908','LOGIN','System',NULL,'Initialisation de la base de données et chargement du jeu d’essai complet.','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64)','2026-09-17 08:15:23.056'),('82212c9c-5eff-4696-b9b0-c2fd3745bf91','78807ce9-93ad-4771-89b8-88d153b24caf','6661fa07-e61e-47cc-be9c-a0ef8d8e28a6','LOGOUT','User','6661fa07-e61e-47cc-be9c-a0ef8d8e28a6','Déconnexion de Jean Dupont','127.0.0.1','My Clinique Client App','2026-09-23 07:00:15.450'),('84b6c088-c1a4-4b5d-84f1-c9417657e525','78807ce9-93ad-4771-89b8-88d153b24caf','8970749f-92ff-4553-b2c6-e47e17253211','LOGIN','User','8970749f-92ff-4553-b2c6-e47e17253211','Connexion réussie de Tahina Randria (Pharmacien)','127.0.0.1','My Clinique Client App','2026-09-18 06:50:19.771'),('84d3f4a4-6f04-4a22-ab5a-0f7ad6eabdb9','78807ce9-93ad-4771-89b8-88d153b24caf','8970749f-92ff-4553-b2c6-e47e17253211','LOGOUT','User','8970749f-92ff-4553-b2c6-e47e17253211','Déconnexion de Tahina Randria','127.0.0.1','My Clinique Client App','2026-09-18 07:03:38.755'),('850c4299-b8f2-4b32-85fe-4d72eee1b83f','78807ce9-93ad-4771-89b8-88d153b24caf','8970749f-92ff-4553-b2c6-e47e17253211','LOGIN','User','8970749f-92ff-4553-b2c6-e47e17253211','Connexion réussie de Tahina Randria (Pharmacien)','127.0.0.1','My Clinique Client App','2026-09-23 06:57:49.333'),('8bcb8274-f035-48c5-ad84-f8d2e9640c00','78807ce9-93ad-4771-89b8-88d153b24caf','8970749f-92ff-4553-b2c6-e47e17253211','LOGIN','User','8970749f-92ff-4553-b2c6-e47e17253211','Connexion réussie de Tahina Randria (Pharmacien)','127.0.0.1','My Clinique Client App','2026-09-23 06:43:28.543'),('8d95bc82-8be2-4fb5-b738-1f68405cb798','78807ce9-93ad-4771-89b8-88d153b24caf','6661fa07-e61e-47cc-be9c-a0ef8d8e28a6','DISPENSE','PharmacySale','8c337884-1b06-4c74-8a56-ed30dcd49bbe','Vente pharmacie VTE-2026-0005 effectuée pour un montant de 32000 Ar. Stock déduit automatiquement.','127.0.0.1','My Clinique Client App','2026-09-22 14:20:07.947'),('9b839dad-de66-4abe-9965-b72b4455a9a7','78807ce9-93ad-4771-89b8-88d153b24caf','6661fa07-e61e-47cc-be9c-a0ef8d8e28a6','LOGOUT','User','6661fa07-e61e-47cc-be9c-a0ef8d8e28a6','Déconnexion de Jean Dupont','127.0.0.1','My Clinique Client App','2026-09-17 08:45:38.598'),('a713ea27-1d2a-4d05-b4f4-0fdc9df47fed','78807ce9-93ad-4771-89b8-88d153b24caf','8970749f-92ff-4553-b2c6-e47e17253211','LOGOUT','User','8970749f-92ff-4553-b2c6-e47e17253211','Déconnexion de Tahina Randria','127.0.0.1','My Clinique Client App','2026-09-23 07:08:24.283'),('ae79f18e-3228-4a5d-8d5a-f87ffcab6079','78807ce9-93ad-4771-89b8-88d153b24caf','afa1413e-5d9c-4eb7-aba2-b3f137183908','LOGOUT','User','afa1413e-5d9c-4eb7-aba2-b3f137183908','Déconnexion de Alexandre Dumas','127.0.0.1','My Clinique Client App','2026-09-17 08:34:52.911'),('b1b308fc-e602-4b70-ae34-91ce5f9b4945','78807ce9-93ad-4771-89b8-88d153b24caf','afa1413e-5d9c-4eb7-aba2-b3f137183908','LOGOUT','User','afa1413e-5d9c-4eb7-aba2-b3f137183908','Déconnexion de Alexandre Dumas','127.0.0.1','My Clinique Client App','2026-10-08 16:51:53.302'),('b272450f-c30d-4fe5-8b00-2a911986cfff','78807ce9-93ad-4771-89b8-88d153b24caf','3f42c72f-72c4-40c7-ba8a-7d011b49ec8f','LOGOUT','User','3f42c72f-72c4-40c7-ba8a-7d011b49ec8f','Déconnexion de Fanja Rabary','127.0.0.1','My Clinique Client App','2026-10-08 16:51:40.063'),('b3e6d8db-3dd8-4f51-bb14-cb39137db4db','78807ce9-93ad-4771-89b8-88d153b24caf','3f42c72f-72c4-40c7-ba8a-7d011b49ec8f','LOGOUT','User','3f42c72f-72c4-40c7-ba8a-7d011b49ec8f','Déconnexion de Fanja Rabary','127.0.0.1','My Clinique Client App','2026-09-23 07:00:11.527'),('b6d050b7-e5c3-454b-8b0c-356549b3121d','78807ce9-93ad-4771-89b8-88d153b24caf','8970749f-92ff-4553-b2c6-e47e17253211','LOGIN','User','8970749f-92ff-4553-b2c6-e47e17253211','Connexion réussie de Tahina Randria (Pharmacien)','127.0.0.1','My Clinique Client App','2026-09-23 07:00:17.661'),('cd1c1aba-01ed-4fbe-869f-c13110e797ad','78807ce9-93ad-4771-89b8-88d153b24caf','afa1413e-5d9c-4eb7-aba2-b3f137183908','LOGIN','User','afa1413e-5d9c-4eb7-aba2-b3f137183908','Connexion réussie de Alexandre Dumas (Super Administrateur)','127.0.0.1','My Clinique Client App','2026-10-08 16:51:42.566'),('ce2873d0-17e3-4964-9306-697f0855d856','78807ce9-93ad-4771-89b8-88d153b24caf','6661fa07-e61e-47cc-be9c-a0ef8d8e28a6','DISPENSE','PharmacySale','6308c7c5-323d-426d-a25d-e58f1e7765fa','Vente pharmacie VTE-2026-0006 effectuée pour un montant de 32000 Ar. Stock déduit automatiquement.','127.0.0.1','My Clinique Client App','2026-09-23 06:40:37.117'),('d28e17d5-170b-4ae3-8ef9-5a3ad4eace58','78807ce9-93ad-4771-89b8-88d153b24caf','6661fa07-e61e-47cc-be9c-a0ef8d8e28a6','LOGOUT','User','6661fa07-e61e-47cc-be9c-a0ef8d8e28a6','Déconnexion de Jean Dupont','127.0.0.1','My Clinique Client App','2026-09-17 08:37:17.791'),('d43ed271-20c2-495c-8432-a55366ed5383','78807ce9-93ad-4771-89b8-88d153b24caf','3f42c72f-72c4-40c7-ba8a-7d011b49ec8f','LOGOUT','User','3f42c72f-72c4-40c7-ba8a-7d011b49ec8f','Déconnexion de Fanja Rabary','127.0.0.1','My Clinique Client App','2026-09-23 06:43:26.300'),('d58d094d-fedd-4c88-835f-765c039928b9','78807ce9-93ad-4771-89b8-88d153b24caf','6661fa07-e61e-47cc-be9c-a0ef8d8e28a6','LOGIN','User','6661fa07-e61e-47cc-be9c-a0ef8d8e28a6','Connexion réussie de Jean Dupont (Médecin Praticien)','127.0.0.1','My Clinique Client App','2026-09-23 06:58:06.167'),('e0859fed-cb2a-4f3e-9a6f-8eda11f51804','78807ce9-93ad-4771-89b8-88d153b24caf','afa1413e-5d9c-4eb7-aba2-b3f137183908','DISPENSE','PharmacySale','3bfcd244-2929-4f9f-9b44-dbc8fa3e8300','Vente pharmacie VTE-2026-0002 effectuée pour un montant de 110000 Ar. Stock déduit automatiquement.','127.0.0.1','My Clinique Client App','2026-09-22 13:47:32.821'),('e68d7f66-9d8d-48aa-90cd-d2f7214c395f','78807ce9-93ad-4771-89b8-88d153b24caf','3f42c72f-72c4-40c7-ba8a-7d011b49ec8f','LOGIN','User','3f42c72f-72c4-40c7-ba8a-7d011b49ec8f','Connexion réussie de Fanja Rabary (Réceptionniste)','127.0.0.1','My Clinique Client App','2026-09-23 06:56:09.125'),('e79589e0-326a-4ab8-80d0-b396a14b326b','78807ce9-93ad-4771-89b8-88d153b24caf','afa1413e-5d9c-4eb7-aba2-b3f137183908','LOGOUT','User','afa1413e-5d9c-4eb7-aba2-b3f137183908','Déconnexion de Alexandre Dumas','127.0.0.1','My Clinique Client App','2026-09-17 08:41:05.224'),('ea5e32d0-f0b7-4822-9695-6e4cc4264888','78807ce9-93ad-4771-89b8-88d153b24caf','6661fa07-e61e-47cc-be9c-a0ef8d8e28a6','LOGOUT','User','6661fa07-e61e-47cc-be9c-a0ef8d8e28a6','Déconnexion de Jean Dupont','127.0.0.1','My Clinique Client App','2026-09-23 06:59:55.831'),('fd68704d-1a96-44e5-bc3c-3c76a49ed42c','78807ce9-93ad-4771-89b8-88d153b24caf','6661fa07-e61e-47cc-be9c-a0ef8d8e28a6','LOGIN','User','6661fa07-e61e-47cc-be9c-a0ef8d8e28a6','Connexion réussie de Jean Dupont (Médecin Praticien)','127.0.0.1','My Clinique Client App','2026-09-17 08:34:54.890');
/*!40000 ALTER TABLE `auditlog` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cashtransaction`
--

DROP TABLE IF EXISTS `cashtransaction`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cashtransaction` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `clinicId` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('INCOME','EXPENSE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` double NOT NULL,
  `paymentMethod` enum('CASH','MOBILE_MONEY','CREDIT_CARD','BANK_TRANSFER') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'CASH',
  `reference` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `transactionDate` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `performedById` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `CashTransaction_clinicId_idx` (`clinicId`),
  KEY `CashTransaction_type_idx` (`type`),
  KEY `CashTransaction_transactionDate_idx` (`transactionDate`),
  KEY `CashTransaction_performedById_fkey` (`performedById`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cashtransaction`
--

LOCK TABLES `cashtransaction` WRITE;
/*!40000 ALTER TABLE `cashtransaction` DISABLE KEYS */;
INSERT INTO `cashtransaction` VALUES ('278b22ec-00df-4708-b6f8-bd224f6b197e','78807ce9-93ad-4771-89b8-88d153b24caf','INCOME','Pharmacie',110000,'CASH','VTE-2026-0002','Vente pharmacie comptoir VTE-2026-0002 (Client de passage)','2026-09-22 13:47:32.807','afa1413e-5d9c-4eb7-aba2-b3f137183908','2026-09-22 13:47:32.807'),('4796addd-ae9d-4ea4-8aaf-c374b74aed55','78807ce9-93ad-4771-89b8-88d153b24caf','INCOME','Consultation',35000,'MOBILE_MONEY','FAC-2026-0002','Encaissement consultation Razafindrakoto Marie Thérèse','2026-09-17 08:15:22.990',NULL,'2026-09-17 08:15:22.990'),('542be766-bfb1-49da-8d83-aa2978f9606a','78807ce9-93ad-4771-89b8-88d153b24caf','INCOME','Pharmacie',12500,'CASH','VTE-2026-0003','Vente pharmacie comptoir VTE-2026-0003 (Client de passage)','2026-09-22 14:14:46.965','afa1413e-5d9c-4eb7-aba2-b3f137183908','2026-09-22 14:14:46.965'),('661c8362-8d39-4229-a2bb-53cb96d6bce3','78807ce9-93ad-4771-89b8-88d153b24caf','INCOME','Consultation',35000,'CASH','FAC-2026-0003','Encaissement consultation Rasoanantenaina Chantal','2026-09-17 08:15:23.004',NULL,'2026-09-17 08:15:23.004'),('69b9b0c2-22aa-4c57-944b-03bfe39230da','78807ce9-93ad-4771-89b8-88d153b24caf','INCOME','Actes médicaux',75000,'MOBILE_MONEY','FAC-2026-0101','Acompte acte médical pour Randrianasolo','2026-09-17 08:15:23.025',NULL,'2026-09-17 08:15:23.025'),('95d9f9c4-32b5-4099-bdc6-6622b4d1986e','78807ce9-93ad-4771-89b8-88d153b24caf','INCOME','Consultation',35000,'CASH','FAC-2026-0001','Encaissement consultation Ravalomanana Jean-Baptiste','2026-09-17 08:15:22.974',NULL,'2026-09-17 08:15:22.974'),('a60f7f5d-41c8-450d-ace3-f1ae5b1d9622','78807ce9-93ad-4771-89b8-88d153b24caf','INCOME','Consultation',35000,'MOBILE_MONEY','FAC-2026-0004','Encaissement consultation Andriamanantena Faly Herizo','2026-09-17 08:15:23.018',NULL,'2026-09-17 08:15:23.018'),('b78dc90d-57f4-480a-b4f5-d8cf4f2e056e','78807ce9-93ad-4771-89b8-88d153b24caf','INCOME','Pharmacie',32000,'CASH','VTE-2026-0006','Vente pharmacie comptoir VTE-2026-0006 (Client de passage)','2026-09-23 06:40:37.106','6661fa07-e61e-47cc-be9c-a0ef8d8e28a6','2026-09-23 06:40:37.106'),('e4935844-7d40-459f-92f5-244851354ecc','78807ce9-93ad-4771-89b8-88d153b24caf','INCOME','Pharmacie',17000,'CASH','VTE-2026-0001','Vente pharmacie comptoir','2026-09-17 08:15:23.046',NULL,'2026-09-17 08:15:23.046'),('ef051025-d324-4fb3-b0a6-c3ffe8d230d4','78807ce9-93ad-4771-89b8-88d153b24caf','INCOME','Pharmacie',32000,'MOBILE_MONEY','VTE-2026-0005','Vente pharmacie comptoir VTE-2026-0005 (Client de passage)','2026-09-22 14:20:07.942','6661fa07-e61e-47cc-be9c-a0ef8d8e28a6','2026-09-22 14:20:07.942'),('efd71b7c-ee30-4fcf-8e48-bd99a8a86bc3','78807ce9-93ad-4771-89b8-88d153b24caf','INCOME','Pharmacie',32000,'CASH','VTE-2026-0004','Vente pharmacie comptoir VTE-2026-0004 (Client de passage)','2026-09-22 14:15:46.713','6661fa07-e61e-47cc-be9c-a0ef8d8e28a6','2026-09-22 14:15:46.713'),('f1795483-0f14-4a3a-ac7b-40a0841259ad','78807ce9-93ad-4771-89b8-88d153b24caf','INCOME','Actes médicaux',50000,'MOBILE_MONEY','FAC-2026-0102','Acompte acte médical pour Ramanandraibe','2026-09-17 08:15:23.031',NULL,'2026-09-17 08:15:23.031');
/*!40000 ALTER TABLE `cashtransaction` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chatmessage`
--

DROP TABLE IF EXISTS `chatmessage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chatmessage` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `clinicId` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `senderId` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `receiverId` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `isRead` tinyint(1) NOT NULL DEFAULT '0',
  `readAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `ChatMessage_clinicId_idx` (`clinicId`),
  KEY `ChatMessage_senderId_receiverId_idx` (`senderId`,`receiverId`),
  KEY `ChatMessage_receiverId_isRead_idx` (`receiverId`,`isRead`),
  KEY `ChatMessage_createdAt_idx` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chatmessage`
--

LOCK TABLES `chatmessage` WRITE;
/*!40000 ALTER TABLE `chatmessage` DISABLE KEYS */;
INSERT INTO `chatmessage` VALUES ('6aa79e81-924b-4df4-8325-84a7d78fc85c','78807ce9-93ad-4771-89b8-88d153b24caf','6661fa07-e61e-47cc-be9c-a0ef8d8e28a6','8970749f-92ff-4553-b2c6-e47e17253211','Bonjour Tahina',1,'2026-09-18 06:54:41.482','2026-09-17 08:49:20.291'),('89a2eeb8-6f0b-4b6f-ad29-d87bed910392','78807ce9-93ad-4771-89b8-88d153b24caf','6661fa07-e61e-47cc-be9c-a0ef8d8e28a6','8970749f-92ff-4553-b2c6-e47e17253211','Parfait, merci beaucoup pour la réactivité !',1,'2026-09-17 08:24:06.089','2026-09-17 08:22:06.089'),('b0ffd052-bbc9-483a-87cc-1db2cda41521','78807ce9-93ad-4771-89b8-88d153b24caf','afa1413e-5d9c-4eb7-aba2-b3f137183908','6661fa07-e61e-47cc-be9c-a0ef8d8e28a6','Bonjour Docteur, réunion du comité médical confirmée demain à 08h30 en salle de conférence.',1,'2026-09-17 07:42:06.094','2026-09-17 06:42:06.094'),('d289fe7e-41ac-4d50-9a1c-b4d68484e55a','78807ce9-93ad-4771-89b8-88d153b24caf','3f42c72f-72c4-40c7-ba8a-7d011b49ec8f','6661fa07-e61e-47cc-be9c-a0ef8d8e28a6','Docteur, votre patient de 11h (M. Jean-Baptiste) vient d’arriver en salle d’attente.',1,'2026-09-17 08:49:02.527','2026-09-17 08:32:06.091'),('d4245ef8-880b-4fac-a265-41c5e4815f2d','78807ce9-93ad-4771-89b8-88d153b24caf','8970749f-92ff-4553-b2c6-e47e17253211','6661fa07-e61e-47cc-be9c-a0ef8d8e28a6','Bonjour Dr Dupont ! Oui, il nous reste 45 boîtes du lot AMX-2026-01. Vous pouvez prescrire sans problème.',1,'2026-09-17 08:17:06.087','2026-09-17 08:12:06.087'),('dcd126ec-c9a8-456a-a8e0-ed69ba6f886a','78807ce9-93ad-4771-89b8-88d153b24caf','6661fa07-e61e-47cc-be9c-a0ef8d8e28a6','3f42c72f-72c4-40c7-ba8a-7d011b49ec8f','Merci Aina, demandez-lui de préparer son carnet de santé s’il vous plaît.',1,'2026-09-23 06:42:06.659','2026-09-17 08:37:06.096'),('ef66cc4f-1267-4820-9dd9-21082a02f944','78807ce9-93ad-4771-89b8-88d153b24caf','6661fa07-e61e-47cc-be9c-a0ef8d8e28a6','8970749f-92ff-4553-b2c6-e47e17253211','Bonjour Sarah, est-ce qu’on a encore de l’Amoxicilline 500mg en stock pour le patient Ravalomanana ?',1,'2026-09-17 08:07:06.082','2026-09-17 08:02:06.082'),('f87b6793-d4ff-4abf-9f38-60056924b66a','78807ce9-93ad-4771-89b8-88d153b24caf','8970749f-92ff-4553-b2c6-e47e17253211','afa1413e-5d9c-4eb7-aba2-b3f137183908','Bonjour Alexandre, la commande fournisseur Salama est arrivée ce matin, bons de livraison validés.',1,'2026-09-22 13:41:50.370','2026-09-17 08:27:06.098');
/*!40000 ALTER TABLE `chatmessage` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clinic`
--

DROP TABLE IF EXISTS `clinic`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clinic` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Clinique Médicale Saint-Luc',
  `slug` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'saint-luc',
  `slogan` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT 'La gestion intelligente de votre clinique',
  `logoUrl` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '/logo/my-clinique-logo.svg',
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT 'Lot IVG 35 Antananarivo, Madagascar',
  `phone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT '+261 20 22 123 45',
  `email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT 'contact@myclinique.mg',
  `website` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT 'https://myclinique.mg',
  `taxId` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'NIF: 3000123456 / STAT: 85111',
  `currency` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Ar',
  `dateFormat` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DD/MM/YYYY',
  `timeZone` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Indian/Antananarivo',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Clinic_slug_key` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clinic`
--

LOCK TABLES `clinic` WRITE;
/*!40000 ALTER TABLE `clinic` DISABLE KEYS */;
INSERT INTO `clinic` VALUES ('78807ce9-93ad-4771-89b8-88d153b24caf','Clinique Médicale M-It','saint-luc','La gestion intelligente de votre clinique','/logo/my-clinique-logo.svg','Lot IVG 35 Rue Pasteur, Antananarivo 101, Madagascar','+261 20 22 123 45','contact@myclinique.mg','https://m-itlevelup.com','NIF: 3000123456 / STAT: 85111 11 2015 0 00123','Ar','DD/MM/YYYY','Indian/Antananarivo','2026-09-17 08:14:48.728','2026-09-17 08:33:46.139');
/*!40000 ALTER TABLE `clinic` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `consultation`
--

DROP TABLE IF EXISTS `consultation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `consultation` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `patientId` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `doctorId` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `appointmentId` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `consultationDate` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `reason` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `symptoms` text COLLATE utf8mb4_unicode_ci,
  `physicalExamination` text COLLATE utf8mb4_unicode_ci,
  `diagnosis` text COLLATE utf8mb4_unicode_ci,
  `treatment` text COLLATE utf8mb4_unicode_ci,
  `doctorNotes` text COLLATE utf8mb4_unicode_ci,
  `status` enum('IN_PROGRESS','COMPLETED','CANCELLED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'COMPLETED',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Consultation_appointmentId_key` (`appointmentId`),
  KEY `Consultation_patientId_idx` (`patientId`),
  KEY `Consultation_doctorId_idx` (`doctorId`),
  KEY `Consultation_consultationDate_idx` (`consultationDate`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `consultation`
--

LOCK TABLES `consultation` WRITE;
/*!40000 ALTER TABLE `consultation` DISABLE KEYS */;
INSERT INTO `consultation` VALUES ('0b8be551-dfae-4b16-9290-ba9cd835e34d','08d1364a-d211-49f2-b6dc-17ab147312d3','46d5d44b-5b92-4c20-9d40-c599448c263a',NULL,'2026-09-17 08:15:22.926','Lésion érythémateuse squameuse au coude droit','Prurit intense le soir, desquamation argentée.','Plaque érythémato-squameuse bien délimitée de 4 cm sur la face d’extension du coude droit. Pas d’atteinte unguéale.','Psoriasis en plaques localisé modéré.','Dermocorticoïde local en application quotidienne le soir pendant 15 jours.','Consultation complète avec observation clinique consignée.','COMPLETED','2026-09-17 08:15:23.006','2026-09-17 08:15:23.006'),('182333fc-6bb7-4513-9948-4eb43fbef38a','97ea7c7c-6c1b-46c0-897b-f4a938ca9bce','a7a44e6c-e0cc-455c-9303-f5451d71a41a',NULL,'2026-09-17 08:15:22.926','Bilan de santé annuel et contrôle tensionnel','Légère fatigue en fin de journée, pas de vertiges ni de céphalées.','État général conservé. Auscultation cardio-pulmonaire normale, pas de râles ni de souffles. Abdomen souple et indolore.','Hypertension artérielle stade 1 bien équilibrée sous traitement.','Poursuite de l’hygiène de vie, réduction du sodium alimentaire, contrôle dans 6 mois.','Consultation complète avec observation clinique consignée.','COMPLETED','2026-09-17 08:15:22.954','2026-09-17 08:15:22.954'),('4ceaeb70-6468-4ce1-99d9-d4c115b1286a','394da908-e5a9-47c8-a62a-4c178b746d08','c3fffe6c-5c60-4d61-b211-0cd45ef335c5',NULL,'2026-09-17 08:15:22.926','Palpitations nocturnes et oppression thoracique','Épisodes de tachycardie intermittente réveillant la patiente.','Bruits du cœur réguliers. ECG réalisé : rythme sinusal avec rares extrasystoles auriculaires bénignes. Pouls bien frappés.','Tachycardie sinusale réactionnelle au stress et à l’anxiété.','Magnésium B6, repos, éviction des excitants (café/thé), anxiolytique léger si crise.','Consultation complète avec observation clinique consignée.','COMPLETED','2026-09-17 08:15:22.977','2026-09-17 08:15:22.977'),('77b85595-0238-4dcf-9782-7724a6f84215','df9627af-c2be-4ccf-888e-d6f8a1064ef9','a7a44e6c-e0cc-455c-9303-f5451d71a41a',NULL,'2026-09-17 08:15:22.926','Suivi diabète type 2 et bilan podologique','Polyurie modérée, soif nocturne occasionnelle.','Examen des pieds normal, réflexes rotuliens et achilléens présents. Pression artérielle stable.','Diabète de type 2 modérément équilibré (HbA1c 7.2%).','Renforcement du régime diététique hypoglucidique, activité physique 30 min/jour, adaptation posologique.','Consultation complète avec observation clinique consignée.','COMPLETED','2026-09-17 08:15:22.992','2026-09-17 08:15:22.992');
/*!40000 ALTER TABLE `consultation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `doctor`
--

DROP TABLE IF EXISTS `doctor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `doctor` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `clinicId` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `licenseNumber` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `specialtyId` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bio` text COLLATE utf8mb4_unicode_ci,
  `workingHours` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'Lun - Ven: 08h00 - 17h00',
  `stampUrl` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Doctor_userId_key` (`userId`),
  UNIQUE KEY `Doctor_licenseNumber_key` (`licenseNumber`),
  KEY `Doctor_clinicId_idx` (`clinicId`),
  KEY `Doctor_specialtyId_idx` (`specialtyId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `doctor`
--

LOCK TABLES `doctor` WRITE;
/*!40000 ALTER TABLE `doctor` DISABLE KEYS */;
INSERT INTO `doctor` VALUES ('46d5d44b-5b92-4c20-9d40-c599448c263a','86e2efbd-f1af-4975-9b60-20b714be11be','78807ce9-93ad-4771-89b8-88d153b24caf','ONM-DERM-12019','8c3f132a-0709-491c-9eae-19bf23a7071e','+261 34 02 444 05','Dermatologie générale, dépistage des mélanomes et dermatologie pédiatrique.','Lun - Ven: 08h00 - 16h30',NULL,'2026-09-17 08:14:48.939','2026-09-17 08:14:48.939'),('7a2be79f-448c-455e-ae0d-4c99e51804e9','2d2fb2d5-b5de-48a8-9d05-2b4d083c569e','78807ce9-93ad-4771-89b8-88d153b24caf','ONM-PED-11203','d2c955e5-3fcf-4e74-b5ab-f28c168f9c3a','+261 34 02 444 03','Pédiatre passionnée, prise en charge des nourrissons, vaccinations et néonatalogie.','Lun - Ven: 08h00 - 16h30',NULL,'2026-09-17 08:14:48.927','2026-09-17 08:14:48.927'),('a7a44e6c-e0cc-455c-9303-f5451d71a41a','6661fa07-e61e-47cc-be9c-a0ef8d8e28a6','78807ce9-93ad-4771-89b8-88d153b24caf','ONM-MG-10452','2a7f3f44-8f4d-4c9e-9a1d-fe5c61bdef7f','+261 34 02 444 01','Praticien hospitalier avec 15 ans d’expérience en diagnostic clinique et médecine interne.','Lun - Ven: 08h00 - 16h30',NULL,'2026-09-17 08:14:48.910','2026-09-17 08:14:48.910'),('c3fffe6c-5c60-4d61-b211-0cd45ef335c5','56e6d726-3180-4ea5-a606-aeebed069975','78807ce9-93ad-4771-89b8-88d153b24caf','ONM-CARDIO-10894','670280ae-50ba-4330-a0d6-0d21cd5418f9','+261 34 02 444 02','Spécialiste des pathologies coronariennes, hypertension artérielle et échocardiographie.','Lun - Ven: 08h00 - 16h30',NULL,'2026-09-17 08:14:48.920','2026-09-17 08:14:48.920'),('d4c4a47f-31e8-45a0-894d-d40353d7e3dd','1459db5c-8478-4c20-b243-5d1902a239e1','78807ce9-93ad-4771-89b8-88d153b24caf','ONM-GYN-11450','c1d325cd-a0ce-4e8a-bb8a-132a22c57a71','+261 34 02 444 04','Suivi obstétrical, échographies de grossesse et prévention gynécologique.','Lun - Ven: 08h00 - 16h30',NULL,'2026-09-17 08:14:48.933','2026-09-17 08:14:48.933');
/*!40000 ALTER TABLE `doctor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoice`
--

DROP TABLE IF EXISTS `invoice`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoice` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `invoiceNumber` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `clinicId` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `patientId` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `consultationId` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `totalAmount` double NOT NULL,
  `discountAmount` double NOT NULL DEFAULT '0',
  `taxAmount` double NOT NULL DEFAULT '0',
  `paidAmount` double NOT NULL DEFAULT '0',
  `balance` double NOT NULL DEFAULT '0',
  `status` enum('PAID','PARTIALLY_PAID','UNPAID','CANCELLED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'UNPAID',
  `dueDate` datetime(3) DEFAULT NULL,
  `issuedDate` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `notes` text COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Invoice_invoiceNumber_key` (`invoiceNumber`),
  UNIQUE KEY `Invoice_consultationId_key` (`consultationId`),
  KEY `Invoice_clinicId_idx` (`clinicId`),
  KEY `Invoice_patientId_idx` (`patientId`),
  KEY `Invoice_invoiceNumber_idx` (`invoiceNumber`),
  KEY `Invoice_status_idx` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoice`
--

LOCK TABLES `invoice` WRITE;
/*!40000 ALTER TABLE `invoice` DISABLE KEYS */;
INSERT INTO `invoice` VALUES ('374f66a3-3d17-479a-852b-7659271cf004','FAC-2026-0001','78807ce9-93ad-4771-89b8-88d153b24caf','97ea7c7c-6c1b-46c0-897b-f4a938ca9bce','182333fc-6bb7-4513-9948-4eb43fbef38a',35000,0,0,35000,0,'PAID',NULL,'2026-09-17 08:15:22.926','Paiement comptant consultation médicale.','2026-09-17 08:15:22.967','2026-09-17 08:15:22.967'),('5f863f31-a6a7-4b0c-be99-9bb494655086','FAC-2026-0002','78807ce9-93ad-4771-89b8-88d153b24caf','394da908-e5a9-47c8-a62a-4c178b746d08','4ceaeb70-6468-4ce1-99d9-d4c115b1286a',35000,0,0,35000,0,'PAID',NULL,'2026-09-17 08:15:22.926','Paiement comptant consultation médicale.','2026-09-17 08:15:22.985','2026-09-17 08:15:22.985'),('69816df8-f42c-4194-b246-ea5cf7e8f643','FAC-2026-0003','78807ce9-93ad-4771-89b8-88d153b24caf','df9627af-c2be-4ccf-888e-d6f8a1064ef9','77b85595-0238-4dcf-9782-7724a6f84215',35000,0,0,35000,0,'PAID',NULL,'2026-09-17 08:15:22.926','Paiement comptant consultation médicale.','2026-09-17 08:15:22.999','2026-09-17 08:15:22.999'),('77e8fd7c-1eb0-4673-be0d-e6d6d5ff65b0','FAC-2026-0004','78807ce9-93ad-4771-89b8-88d153b24caf','08d1364a-d211-49f2-b6dc-17ab147312d3','0b8be551-dfae-4b16-9290-ba9cd835e34d',35000,0,0,35000,0,'PAID',NULL,'2026-09-17 08:15:22.926','Paiement comptant consultation médicale.','2026-09-17 08:15:23.014','2026-09-17 08:15:23.014'),('78eb4003-a75c-4036-a9bc-278b623a6c6d','FAC-2026-0104','78807ce9-93ad-4771-89b8-88d153b24caf','b5f562af-344f-4394-81af-f489a4649a9b',NULL,85000,0,0,0,85000,'UNPAID',NULL,'2026-09-17 08:15:22.926','Prestation clinique ambulatoire.','2026-09-17 08:15:23.036','2026-09-17 08:15:23.036'),('dd5fec70-4026-465f-b8b6-4ba0b7991484','FAC-2026-0101','78807ce9-93ad-4771-89b8-88d153b24caf','268c7b61-5dd6-402a-ae66-ff4bf2df3461',NULL,75000,0,0,75000,0,'PAID',NULL,'2026-09-17 08:15:22.926','Prestation clinique ambulatoire.','2026-09-17 08:15:23.020','2026-09-17 08:15:23.020'),('e2451c5b-b807-4c16-8cf0-9c55b0489e3b','FAC-2026-0102','78807ce9-93ad-4771-89b8-88d153b24caf','944bf2ae-12ef-4a7f-b083-815a51a7e3ab',NULL,120000,0,0,50000,70000,'PARTIALLY_PAID',NULL,'2026-09-17 08:15:22.926','Prestation clinique ambulatoire.','2026-09-17 08:15:23.026','2026-09-17 08:15:23.026'),('fbfc14c2-b38a-413f-bbea-d9985ae11178','FAC-2026-0103','78807ce9-93ad-4771-89b8-88d153b24caf','ddd25c0b-db5e-442b-9df0-20895449b9d6',NULL,45000,0,0,0,45000,'UNPAID',NULL,'2026-09-17 08:15:22.926','Prestation clinique ambulatoire.','2026-09-17 08:15:23.033','2026-09-17 08:15:23.033');
/*!40000 ALTER TABLE `invoice` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoiceitem`
--

DROP TABLE IF EXISTS `invoiceitem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoiceitem` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `invoiceId` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `itemType` enum('CONSULTATION','SPECIALIST_CONSULTATION','MEDICAL_PROCEDURE','LABORATORY_TEST','PHARMACY','ROOM_HOSPITALIZATION','OTHER_SERVICE') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'CONSULTATION',
  `quantity` int NOT NULL DEFAULT '1',
  `unitPrice` double NOT NULL,
  `totalPrice` double NOT NULL,
  PRIMARY KEY (`id`),
  KEY `InvoiceItem_invoiceId_idx` (`invoiceId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoiceitem`
--

LOCK TABLES `invoiceitem` WRITE;
/*!40000 ALTER TABLE `invoiceitem` DISABLE KEYS */;
INSERT INTO `invoiceitem` VALUES ('0120107a-6955-4b48-ba68-873891091a1c','69816df8-f42c-4194-b246-ea5cf7e8f643','Consultation Médecine Spécialisée','CONSULTATION',1,35000,35000),('09789553-ad5b-41e9-9f50-ee223408750c','77e8fd7c-1eb0-4673-be0d-e6d6d5ff65b0','Consultation Médecine Spécialisée','CONSULTATION',1,35000,35000),('42c98de6-da11-466e-b56b-d2617ef3f74d','e2451c5b-b807-4c16-8cf0-9c55b0489e3b','Échographie abdominale et pelvienne','MEDICAL_PROCEDURE',1,120000,120000),('4f56bc05-af35-49ea-91a3-75864349cb9b','5f863f31-a6a7-4b0c-be99-9bb494655086','Consultation Médecine Spécialisée','CONSULTATION',1,35000,35000),('53574785-d793-4d04-8385-6eaa7555fc51','dd5fec70-4026-465f-b8b6-4ba0b7991484','Bilan biologique complet (NFS, Glycémie, Bilan lipidique)','MEDICAL_PROCEDURE',1,75000,75000),('55f7ce94-dd32-4544-8132-7682092dddd5','fbfc14c2-b38a-413f-bbea-d9985ae11178','Radiographie pulmonaire face et profil','MEDICAL_PROCEDURE',1,45000,45000),('9a4eb61b-e555-4e23-b741-a3a29b686c6e','78eb4003-a75c-4036-a9bc-278b623a6c6d','Électrocardiogramme d’effort','MEDICAL_PROCEDURE',1,85000,85000),('b4432639-d47e-40a5-a6b1-2aec8f99cdff','374f66a3-3d17-479a-852b-7659271cf004','Consultation Médecine Spécialisée','CONSULTATION',1,35000,35000);
/*!40000 ALTER TABLE `invoiceitem` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medicalrecord`
--

DROP TABLE IF EXISTS `medicalrecord`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medicalrecord` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `patientId` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `allergies` text COLLATE utf8mb4_unicode_ci,
  `chronicDiseases` text COLLATE utf8mb4_unicode_ci,
  `surgicalHistory` text COLLATE utf8mb4_unicode_ci,
  `familyHistory` text COLLATE utf8mb4_unicode_ci,
  `habits` text COLLATE utf8mb4_unicode_ci,
  `bloodTransfusion` tinyint(1) NOT NULL DEFAULT '0',
  `generalNotes` text COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `MedicalRecord_patientId_key` (`patientId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medicalrecord`
--

LOCK TABLES `medicalrecord` WRITE;
/*!40000 ALTER TABLE `medicalrecord` DISABLE KEYS */;
INSERT INTO `medicalrecord` VALUES ('241b5aed-a5db-4a94-8959-bfa6276ab4c2','ddd25c0b-db5e-442b-9df0-20895449b9d6','Aucune','Anémie ferriprive récurrente','Aucune','Diabète ou HTA familiale fréquente','Végétarienne',0,'Dossier médical informatisé My Clinique créé lors de l’admission.','2026-09-17 08:15:22.895','2026-09-17 08:15:22.895'),('24c083bc-59c4-4925-adf7-a814e76096f2','499da0d5-a58d-4447-9998-e73672895cc7','Fruits de mer','Aucune','Appendicectomie (2005)','Diabète ou HTA familiale fréquente','Ingénieur en génie civil',0,'Dossier médical informatisé My Clinique créé lors de l’admission.','2026-09-17 08:15:22.934','2026-09-17 08:15:22.934'),('253f59cd-99f3-437b-a930-591a1658dd82','df9627af-c2be-4ccf-888e-d6f8a1064ef9','Aspirine','Diabète de type 2, HTA','Cholécystectomie en 2019','Diabète ou HTA familiale fréquente','Régime pauvre en sel et sucre',0,'Dossier médical informatisé My Clinique créé lors de l’admission.','2026-09-17 08:15:22.879','2026-09-17 08:15:22.879'),('281638d1-30b3-401e-8ea3-77a92c200053','8ae11bce-ed45-4f17-967e-86c5c9069732','Oeufs','Eczéma atopique du nourrisson','Aucune','Diabète ou HTA familiale fréquente','Enfant (suivi pédiatrique)',0,'Dossier médical informatisé My Clinique créé lors de l’admission.','2026-09-17 08:15:22.907','2026-09-17 08:15:22.907'),('28937420-5e31-4240-a796-6b2ca4273c49','25b45779-9f14-46e1-aaf3-aaab9ec5616d','Aucune','Aucune','Fracture fémur gauche opérée en 2015','Diabète ou HTA familiale fréquente','Sportif régulier',0,'Dossier médical informatisé My Clinique créé lors de l’admission.','2026-09-17 08:15:22.875','2026-09-17 08:15:22.875'),('32e9aa59-1293-42bd-8fc8-759a34a74218','9da709f1-d33d-4d8d-9db8-a1fdcdcec313','Latex','Lombalgie chronique','Arthroscopie genou (2014)','Diabète ou HTA familiale fréquente','Activité sédentaire',0,'Dossier médical informatisé My Clinique créé lors de l’admission.','2026-09-17 08:15:22.914','2026-09-17 08:15:22.914'),('3e9688ba-4b36-41cf-98dc-9806eaf82779','97ea7c7c-6c1b-46c0-897b-f4a938ca9bce','Pénicilline','Hypertension artérielle modérée','Appendicectomie en 2012','Diabète ou HTA familiale fréquente','Non-fumeur, thé vert',0,'Dossier médical informatisé My Clinique créé lors de l’admission.','2026-09-17 08:15:22.866','2026-09-17 08:15:22.866'),('3fb9a4c0-3a45-4b28-9053-f55a87fa48be','d89c210e-105d-4f56-b039-96f666c8aa32','Morphine','Arthrose bilatérale des genoux, DMLA','Prothèse totale genou gauche (2018)','Diabète ou HTA familiale fréquente','Canne de marche',0,'Dossier médical informatisé My Clinique créé lors de l’admission.','2026-09-17 08:15:22.928','2026-09-17 08:15:22.928'),('45a28b9d-375d-457a-9d2f-fca5faea58cb','6bd52bb4-505f-4799-afb1-00c5dca2e411','Aucune','Hypothyroïdie sous L-Thyroxine','Thyroïdectomie partielle (2019)','Diabète ou HTA familiale fréquente','Bilan semestriel TSH',0,'Dossier médical informatisé My Clinique créé lors de l’admission.','2026-09-17 08:15:22.931','2026-09-17 08:15:22.931'),('52537f29-4ee7-42fb-b8aa-66cbc7ae69c4','24ca2a35-f2f3-4a82-a70b-4a7f6433f96e','Aucune','Grossesse en cours (24 SA)','Aucune','Diabète ou HTA familiale fréquente','Non-fumeuse, vitamines prénatales',0,'Dossier médical informatisé My Clinique créé lors de l’admission.','2026-09-17 08:15:22.910','2026-09-17 08:15:22.910'),('6e85229d-0b2f-437b-be54-40c718055b63','394da908-e5a9-47c8-a62a-4c178b746d08','Arachides, Sulfamides','Asthme bronchique intermittent','Césarienne en 2017','Diabète ou HTA familiale fréquente','Aucun toxique',0,'Dossier médical informatisé My Clinique créé lors de l’admission.','2026-09-17 08:15:22.871','2026-09-17 08:15:22.871'),('7f678e58-d458-478c-9fe7-39892bb42c19','febc2813-3edf-4ebe-bf17-6cb7056cc64c','Pollen','Aucune','Amydalectomie (2010)','Diabète ou HTA familiale fréquente','Étudiante en sciences',0,'Dossier médical informatisé My Clinique créé lors de l’admission.','2026-09-17 08:15:22.925','2026-09-17 08:15:22.925'),('9945b150-d1b9-413b-ad48-8d83c1e642f8','944bf2ae-12ef-4a7f-b083-815a51a7e3ab','Aucune','Migraine ophtalmique','Aucune','Diabète ou HTA familiale fréquente','Café (2 tasses/jour)',0,'Dossier médical informatisé My Clinique créé lors de l’admission.','2026-09-17 08:15:22.888','2026-09-17 08:15:22.888'),('a33e5288-e706-4823-a049-bf19ffac4712','f12e5e44-56b1-4d64-9eb4-805f5f53c23f','Aucune','Hyperuricémie (Goutte)','Aucune','Diabète ou HTA familiale fréquente','Régime surveillé',0,'Dossier médical informatisé My Clinique créé lors de l’admission.','2026-09-17 08:15:22.921','2026-09-17 08:15:22.921'),('c6e1f223-41c5-4249-a2fa-84174cf5f938','268c7b61-5dd6-402a-ae66-ff4bf2df3461','Poussière, Acariens','Rhinite allergique','Aucune','Diabète ou HTA familiale fréquente','Étudiant',0,'Dossier médical informatisé My Clinique créé lors de l’admission.','2026-09-17 08:15:22.883','2026-09-17 08:15:22.883'),('ca0d085e-57de-4587-b33f-740062ab4741','c1cac1f1-03df-479a-b1f2-d0785ff5ac87','Céphalosporines','Syndrome du côlon irritable','Aucune','Diabète ou HTA familiale fréquente','Comptable',0,'Dossier médical informatisé My Clinique créé lors de l’admission.','2026-09-17 08:15:22.938','2026-09-17 08:15:22.938'),('cfc4f9b3-5d8e-4b13-9e33-272a7118e7bd','70d2be32-5bd8-4adc-ad6b-584443c35a4b','AINS','Ulcère gastroduodénal cicatrisé','Aucune','Diabète ou HTA familiale fréquente','Employée de bureau',0,'Dossier médical informatisé My Clinique créé lors de l’admission.','2026-09-17 08:15:22.917','2026-09-17 08:15:22.917'),('e4935df2-f327-47b9-8d7b-f9e3be6d348c','b5f562af-344f-4394-81af-f489a4649a9b','Pénicilline, Codéine','Insuffisance coronarienne, Dyslipidémie','Pontage aorto-coronarien en 2016','Diabète ou HTA familiale fréquente','Retraité, marche quotidienne',0,'Dossier médical informatisé My Clinique créé lors de l’admission.','2026-09-17 08:15:22.899','2026-09-17 08:15:22.899'),('eb9d80bf-e089-44f2-8c0f-259de8eda428','ec561022-7d2b-48ef-9607-3e1accecc1ae','Aucune','Aucune','Aucune','Diabète ou HTA familiale fréquente','Lycéenne',0,'Dossier médical informatisé My Clinique créé lors de l’admission.','2026-09-17 08:15:22.903','2026-09-17 08:15:22.903'),('f6851751-66d7-4914-b021-98d45db7a3ba','08d1364a-d211-49f2-b6dc-17ab147312d3','Iode de contraste','Gastrite chronique','Hernie inguinale droite (2020)','Diabète ou HTA familiale fréquente','Fumeur modéré (5 cig/jour)',0,'Dossier médical informatisé My Clinique créé lors de l’admission.','2026-09-17 08:15:22.892','2026-09-17 08:15:22.892');
/*!40000 ALTER TABLE `medicalrecord` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medicine`
--

DROP TABLE IF EXISTS `medicine`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medicine` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `clinicId` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `genericName` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `categoryId` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `manufacturer` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dosage` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `form` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `purchasePrice` double NOT NULL,
  `sellingPrice` double NOT NULL,
  `currentStock` int NOT NULL DEFAULT '0',
  `minStockLevel` int NOT NULL DEFAULT '10',
  `expiryDate` datetime(3) DEFAULT NULL,
  `location` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'Rayon A - Tiroir 1',
  `barcode` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Medicine_clinicId_idx` (`clinicId`),
  KEY `Medicine_categoryId_idx` (`categoryId`),
  KEY `Medicine_name_idx` (`name`),
  KEY `Medicine_genericName_idx` (`genericName`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medicine`
--

LOCK TABLES `medicine` WRITE;
/*!40000 ALTER TABLE `medicine` DISABLE KEYS */;
INSERT INTO `medicine` VALUES ('09ad3fea-c5e9-4adb-ac06-e488be025625','78807ce9-93ad-4771-89b8-88d153b24caf','Célestène Gouttes 0.05%','Bétaméthasone','290dfbf6-c5cf-4693-9621-afb9e73bdd31','Fournisseur Certifié','0.05%','Flacon compte-gouttes 30 ml',13500,19500,14,10,'2027-02-18 00:00:00.000','Rayon C3',NULL,1,'2026-09-17 08:15:22.858','2026-09-17 08:15:22.858'),('180c088e-06ef-4f6b-baab-921cf4becad5','78807ce9-93ad-4771-89b8-88d153b24caf','Sérum Glucosé 5%','Glucose injectable','7873696c-d9ea-4dd7-b2b5-38728977b772','Fournisseur Certifié','5%','Poche 500 ml',6000,9000,60,25,'2028-04-30 00:00:00.000','Réserve Solutés',NULL,1,'2026-09-17 08:15:22.856','2026-09-17 08:15:22.856'),('1b1e0e03-8e6a-4259-b25c-ba62e14bdf4e','78807ce9-93ad-4771-89b8-88d153b24caf','Voltarène 75 mg','Diclofénac sodique','290dfbf6-c5cf-4693-9621-afb9e73bdd31','Fournisseur Certifié','75 mg','Comprimé enrobé',8000,12000,50,20,'2027-03-30 00:00:00.000','Rayon C1',NULL,1,'2026-09-17 08:15:22.806','2026-09-17 08:15:22.806'),('1b5aafc1-92b8-4202-9cd9-e9470e463771','78807ce9-93ad-4771-89b8-88d153b24caf','Amlodipine 5 mg','Bésylate d’amlodipine','0f4ac93b-c8d9-4678-86d8-106b446e62bc','Fournisseur Certifié','5 mg','Gélule',11000,16000,55,20,'2027-11-01 00:00:00.000','Rayon D1',NULL,1,'2026-09-17 08:15:22.811','2026-09-17 08:15:22.811'),('2126b7f2-4135-4856-8cb5-e96a9adfdf27','78807ce9-93ad-4771-89b8-88d153b24caf','Amoxicilline Biogaran 500 mg','Amoxicilline','262bf38f-7000-4024-82c6-591a6a341dc8','Fournisseur Certifié','500 mg','Gélule',8500,12500,63,25,'2027-01-10 00:00:00.000','Rayon B2',NULL,1,'2026-09-17 08:15:22.793','2026-09-22 14:14:46.942'),('249ee90e-1620-4b4a-93a5-c322485d2817','78807ce9-93ad-4771-89b8-88d153b24caf','Tramadol 50 mg','Tramadol chlorhydrate','7873696c-d9ea-4dd7-b2b5-38728977b772','Fournisseur Certifié','50 mg','Gélule',12000,16500,35,15,'2026-11-20 00:00:00.000','Armoire sécurisée B',NULL,1,'2026-09-17 08:15:22.790','2026-09-17 08:15:22.790'),('255b7248-1683-445c-a12c-d55d488ae2ef','78807ce9-93ad-4771-89b8-88d153b24caf','Ventoline 100 µg','Salbutamol','290dfbf6-c5cf-4693-9621-afb9e73bdd31','Fournisseur Certifié','100 µg','Flacon aérosol 200 doses',20000,29000,2,12,'2026-09-25 00:00:00.000','Rayon C4',NULL,1,'2026-09-17 08:15:22.860','2026-09-17 08:15:22.860'),('29ee2757-483f-4ae3-a859-aec2beeb9d6a','78807ce9-93ad-4771-89b8-88d153b24caf','Artésunate Injectable 60 mg','Artésunate','007aff22-cb38-4b20-8b7f-a150f0c831da','Fournisseur Certifié','60 mg','Flacon injectable',18000,26000,29,15,'2027-06-15 00:00:00.000','Rayon F1',NULL,1,'2026-09-17 08:15:22.835','2026-09-22 13:47:32.770'),('2f81674a-e620-4d2f-bb32-0d759a1e89a9','78807ce9-93ad-4771-89b8-88d153b24caf','Ciprofloxacine 500 mg','Ciprofloxacine','262bf38f-7000-4024-82c6-591a6a341dc8','Fournisseur Certifié','500 mg','Comprimé',9000,14000,42,15,'2027-06-25 00:00:00.000','Rayon B3',NULL,1,'2026-09-17 08:15:22.801','2026-09-17 08:15:22.801'),('3731b1ed-fda1-4c1a-9d00-20f49445f852','78807ce9-93ad-4771-89b8-88d153b24caf','Kardégic 75 mg','Acétylsalicylate de lysine','0f4ac93b-c8d9-4678-86d8-106b446e62bc','Fournisseur Certifié','75 mg','Poudre pour solution',13000,18500,60,20,'2028-01-10 00:00:00.000','Rayon D2',NULL,1,'2026-09-17 08:15:22.816','2026-09-17 08:15:22.816'),('37df19e0-540e-4758-9903-d0cc549e1b21','78807ce9-93ad-4771-89b8-88d153b24caf','Spasfon Lyoc 80 mg','Phloroglucinol','96d8e0cd-492e-4bd7-b7be-35738046e975','Fournisseur Certifié','80 mg','Lyophilisat oral',7500,11000,95,30,'2027-09-01 00:00:00.000','Rayon E2',NULL,1,'2026-09-17 08:15:22.828','2026-09-17 08:15:22.828'),('4157cc21-7340-490a-84d9-b8812b144a00','78807ce9-93ad-4771-89b8-88d153b24caf','Azithromycine 500 mg','Azithromycine','262bf38f-7000-4024-82c6-591a6a341dc8','Fournisseur Certifié','500 mg','Comprimé',15000,22000,3,10,'2026-10-15 00:00:00.000','Rayon B3',NULL,1,'2026-09-17 08:15:22.799','2026-09-22 13:47:32.783'),('4e83e6e0-29fb-4924-80f1-92d36efe23f7','78807ce9-93ad-4771-89b8-88d153b24caf','Bévitine B1-B6','Thiamine + Pyridoxine','a4124711-2a88-4ee7-b667-2b9693fe4e9b','Fournisseur Certifié','250 mg','Comprimé',7000,10500,39,15,'2027-08-14 00:00:00.000','Rayon H2',NULL,1,'2026-09-17 08:15:22.849','2026-09-22 13:47:32.787'),('5403332e-46dc-45ac-9c2c-6ba8313d1808','78807ce9-93ad-4771-89b8-88d153b24caf','Smecta 3 g','Diosmectite','96d8e0cd-492e-4bd7-b7be-35738046e975','Fournisseur Certifié','3 g','Sachet suspension',1800,2800,200,50,'2028-05-15 00:00:00.000','Rayon E2',NULL,1,'2026-09-17 08:15:22.825','2026-09-17 08:15:22.825'),('690b9396-38ce-4642-8c42-3c19a75450a0','78807ce9-93ad-4771-89b8-88d153b24caf','Bétadine Dermique 10%','Povidone iodée','e89571de-fdc6-4b7d-8501-00727a647560','Fournisseur Certifié','10%','Flacon 125 ml',8000,12000,45,20,'2027-04-22 00:00:00.000','Rayon G1',NULL,1,'2026-09-17 08:15:22.838','2026-09-17 08:15:22.838'),('768161bd-2b7c-457e-a149-8e2593651c8c','78807ce9-93ad-4771-89b8-88d153b24caf','Vitamine C 1000 mg','Acide ascorbique','a4124711-2a88-4ee7-b667-2b9693fe4e9b','Fournisseur Certifié','1000 mg','Tube effervescent',6000,9000,85,25,'2028-02-28 00:00:00.000','Rayon H1',NULL,1,'2026-09-17 08:15:22.846','2026-09-17 08:15:22.846'),('86c586b8-cc7f-426a-80f5-fdf8145a0012','78807ce9-93ad-4771-89b8-88d153b24caf','Coartem 20/120','Artéméther + Luméfantrine','007aff22-cb38-4b20-8b7f-a150f0c831da','Fournisseur Certifié','20/120 mg','Comprimé',11000,16000,120,40,'2027-12-31 00:00:00.000','Rayon F1',NULL,1,'2026-09-17 08:15:22.833','2026-09-17 08:15:22.833'),('8c7e83b3-f43a-491e-8c17-e358479d3b8a','78807ce9-93ad-4771-89b8-88d153b24caf','Fucidine 2%','Acide fusidique','e89571de-fdc6-4b7d-8501-00727a647560','Fournisseur Certifié','2%','Tube crème 15 g',12500,18000,22,12,'2027-03-10 00:00:00.000','Rayon G2',NULL,1,'2026-09-17 08:15:22.842','2026-09-17 08:15:22.842'),('93a885d0-5e04-46ef-9e97-3a4f3944b2b4','78807ce9-93ad-4771-89b8-88d153b24caf','Zinc 20 mg Comprimés','Sulfate de zinc','a4124711-2a88-4ee7-b667-2b9693fe4e9b','Fournisseur Certifié','20 mg','Comprimé dispersible',4000,6500,70,20,'2027-11-15 00:00:00.000','Rayon H2',NULL,1,'2026-09-17 08:15:22.851','2026-09-17 08:15:22.851'),('9cbdfc9a-93cb-4600-84c4-d05f29c8a835','78807ce9-93ad-4771-89b8-88d153b24caf','Biafine Émulsion','Trolamine','e89571de-fdc6-4b7d-8501-00727a647560','Fournisseur Certifié','0.67%','Tube 93 g',15000,22000,3,10,'2026-10-01 00:00:00.000','Rayon G2',NULL,1,'2026-09-17 08:15:22.844','2026-09-17 08:15:22.844'),('a6d2dcbd-781e-44aa-b1d3-75fc90a95f4e','78807ce9-93ad-4771-89b8-88d153b24caf','Solupred 20 mg','Prednisolone','290dfbf6-c5cf-4693-9621-afb9e73bdd31','Fournisseur Certifié','20 mg','Comprimé orodispersible',14000,20000,38,15,'2027-05-12 00:00:00.000','Rayon C2',NULL,1,'2026-09-17 08:15:22.809','2026-09-17 08:15:22.809'),('a841ead1-63c6-4ba3-88b0-201b3efbc6d9','78807ce9-93ad-4771-89b8-88d153b24caf','Doliprane 1000 mg','Paracétamol','7873696c-d9ea-4dd7-b2b5-38728977b772','Fournisseur Certifié','1000 mg','Comprimé',3500,5000,140,25,'2027-08-30 00:00:00.000','Rayon A1',NULL,1,'2026-09-17 08:15:22.783','2026-09-17 08:15:22.783'),('b5a7b0fd-0fd4-428d-a6a5-17d91b86d8cd','78807ce9-93ad-4771-89b8-88d153b24caf','Sérum Physiologique 0.9%','Chlorure de sodium','7873696c-d9ea-4dd7-b2b5-38728977b772','Fournisseur Certifié','0.9%','Poche 500 ml',5500,8500,90,30,'2028-04-30 00:00:00.000','Réserve Solutés',NULL,1,'2026-09-17 08:15:22.854','2026-09-17 08:15:22.854'),('cad697cd-38ab-476e-8a7f-27804ad5e165','78807ce9-93ad-4771-89b8-88d153b24caf','Ibuprofène 400 mg','Ibuprofène','290dfbf6-c5cf-4693-9621-afb9e73bdd31','Fournisseur Certifié','400 mg','Comprimé',4500,7000,110,30,'2027-09-18 00:00:00.000','Rayon C1',NULL,1,'2026-09-17 08:15:22.804','2026-09-17 08:15:22.804'),('cc4d27a0-ac5f-48b7-aa8e-0fafb78a4134','78807ce9-93ad-4771-89b8-88d153b24caf','Inexium 20 mg','Esoméprazole','96d8e0cd-492e-4bd7-b7be-35738046e975','Fournisseur Certifié','20 mg','Gélule gastro-résistante',16000,23500,72,25,'2027-10-10 00:00:00.000','Rayon E1',NULL,1,'2026-09-17 08:15:22.822','2026-09-17 08:15:22.822'),('d44b86f0-dd05-499e-8783-c62183bf5155','78807ce9-93ad-4771-89b8-88d153b24caf','Efferalgan 500 mg','Paracétamol','7873696c-d9ea-4dd7-b2b5-38728977b772','Fournisseur Certifié','500 mg','Comprimé effervescent',4000,6000,80,20,'2027-04-15 00:00:00.000','Rayon A1',NULL,1,'2026-09-17 08:15:22.787','2026-09-17 08:15:22.787'),('db124791-ec1b-4cf7-929b-49ed19b59f23','78807ce9-93ad-4771-89b8-88d153b24caf','Augmentin 1 g / 125 mg','Amoxicilline + Acide Clavulanique','262bf38f-7000-4024-82c6-591a6a341dc8','Fournisseur Certifié','1 g','Comprimé pelliculé',22000,32000,5,15,'2026-12-05 00:00:00.000','Rayon B2',NULL,1,'2026-09-17 08:15:22.796','2026-09-23 06:40:37.068'),('dddb0726-f352-4a84-8943-997cfc459ecd','78807ce9-93ad-4771-89b8-88d153b24caf','Gaviscon Suspension','Alginate de sodium','96d8e0cd-492e-4bd7-b7be-35738046e975','Fournisseur Certifié','250 ml','Flacon 250 ml',14000,21000,5,15,'2026-10-28 00:00:00.000','Rayon E3',NULL,1,'2026-09-17 08:15:22.831','2026-09-17 08:15:22.831'),('ec55f4d6-5e0f-46b6-9390-2e53b8f82430','78807ce9-93ad-4771-89b8-88d153b24caf','Co-Aprovel 150/12.5 mg','Irbésartan + Hydrochlorothiazide','0f4ac93b-c8d9-4678-86d8-106b446e62bc','Fournisseur Certifié','150 mg','Comprimé',28000,39000,24,10,'2027-07-20 00:00:00.000','Rayon D1',NULL,1,'2026-09-17 08:15:22.814','2026-09-22 13:47:32.790'),('edd29656-8f28-4ec7-b38b-965082b3b191','78807ce9-93ad-4771-89b8-88d153b24caf','Tahor 20 mg','Atorvastatine','0f4ac93b-c8d9-4678-86d8-106b446e62bc','Fournisseur Certifié','20 mg','Comprimé pelliculé',25000,35000,19,15,'2027-02-14 00:00:00.000','Rayon D2',NULL,1,'2026-09-17 08:15:22.819','2026-09-17 08:15:22.819');
/*!40000 ALTER TABLE `medicine` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medicinecategory`
--

DROP TABLE IF EXISTS `medicinecategory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medicinecategory` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `MedicineCategory_name_key` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medicinecategory`
--

LOCK TABLES `medicinecategory` WRITE;
/*!40000 ALTER TABLE `medicinecategory` DISABLE KEYS */;
INSERT INTO `medicinecategory` VALUES ('007aff22-cb38-4b20-8b7f-a150f0c831da','Antipaludéens','Traitement et prévention du paludisme','2026-09-17 08:14:49.001'),('0f4ac93b-c8d9-4678-86d8-106b446e62bc','Cardiologie & Hypertension','Régulation de la tension artérielle et rythme cardiaque','2026-09-17 08:14:48.986'),('262bf38f-7000-4024-82c6-591a6a341dc8','Antibiotiques','Traitement des infections bactériennes','2026-09-17 08:14:48.980'),('290dfbf6-c5cf-4693-9621-afb9e73bdd31','Anti-inflammatoires','AINS et corticoïdes','2026-09-17 08:14:48.983'),('7873696c-d9ea-4dd7-b2b5-38728977b772','Antalgiques & Antipyrétiques','Contre la douleur et la fièvre','2026-09-17 08:14:48.973'),('96d8e0cd-492e-4bd7-b7be-35738046e975','Gastro-entérologie','Estomac, digestion et transit intestinal','2026-09-17 08:14:48.989'),('a4124711-2a88-4ee7-b667-2b9693fe4e9b','Vitamines & Compléments','Renforcement immunitaire et toniques','2026-09-17 08:14:48.994'),('e89571de-fdc6-4b7d-8501-00727a647560','Dermatologie','Pommade, crèmes et antiseptiques cutanés','2026-09-17 08:14:48.998');
/*!40000 ALTER TABLE `medicinecategory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notification`
--

DROP TABLE IF EXISTS `notification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notification` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `clinicId` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('LOW_STOCK','EXPIRY_WARNING','APPOINTMENT_REMINDER','NEW_PATIENT','NEW_PRESCRIPTION','PAYMENT_RECEIVED','SYSTEM') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SYSTEM',
  `isRead` tinyint(1) NOT NULL DEFAULT '0',
  `linkUrl` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `Notification_clinicId_idx` (`clinicId`),
  KEY `Notification_userId_idx` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification`
--

LOCK TABLES `notification` WRITE;
/*!40000 ALTER TABLE `notification` DISABLE KEYS */;
INSERT INTO `notification` VALUES ('367ea732-c9ae-4f96-ba63-bb214589500e','78807ce9-93ad-4771-89b8-88d153b24caf',NULL,'Péremption Proche','Le lot de Biafine Émulsion expire le 01/10/2026 (< 30 jours).','EXPIRY_WARNING',1,'/pharmacy/medicines','2026-09-17 08:15:23.051'),('45c14e26-9b9d-413d-af54-5a1d0e6d7f4c','78807ce9-93ad-4771-89b8-88d153b24caf',NULL,'Alerte Rupture Imminente','Le stock de Ventoline 100 µg est à 2 unités (seuil : 12). Commander d’urgence.','LOW_STOCK',1,'/pharmacy/stock','2026-09-17 08:15:23.048'),('ab171adb-0497-4445-b49c-66218073468d','78807ce9-93ad-4771-89b8-88d153b24caf',NULL,'Alerte Stock Faible','Augmentin 1 g est en stock faible (8 unités restantes).','LOW_STOCK',1,'/pharmacy/stock','2026-09-17 08:15:23.050'),('c05ed9e3-158c-4ad2-b921-878e955e9b46','78807ce9-93ad-4771-89b8-88d153b24caf',NULL,'Nouveau Patient Enregistré','Dossier PAT-2026-0020 (Hantatiana Ramiandrisoa) créé avec succès.','NEW_PATIENT',1,'/patients','2026-09-17 08:15:23.053'),('f08f2f2c-b458-45a6-b946-a878ad61f217','78807ce9-93ad-4771-89b8-88d153b24caf',NULL,'Paiement Reçu','Règlement de 35 000 Ar validé pour la facture FAC-2026-0001.','PAYMENT_RECEIVED',1,'/invoices','2026-09-17 08:15:23.055');
/*!40000 ALTER TABLE `notification` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `patient`
--

DROP TABLE IF EXISTS `patient`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patient` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `clinicId` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `patientNumber` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `firstName` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lastName` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `gender` enum('MALE','FEMALE','OTHER') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'MALE',
  `birthDate` datetime(3) NOT NULL,
  `bloodGroup` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT 'O+',
  `phone` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'Antananarivo',
  `idCardNumber` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `emergencyContactName` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `emergencyContactPhone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `emergencyContactRel` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `photoUrl` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `primaryDoctorId` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `deletedAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Patient_patientNumber_key` (`patientNumber`),
  KEY `Patient_clinicId_idx` (`clinicId`),
  KEY `Patient_patientNumber_idx` (`patientNumber`),
  KEY `Patient_phone_idx` (`phone`),
  KEY `Patient_lastName_idx` (`lastName`),
  KEY `Patient_firstName_idx` (`firstName`),
  KEY `Patient_primaryDoctorId_fkey` (`primaryDoctorId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patient`
--

LOCK TABLES `patient` WRITE;
/*!40000 ALTER TABLE `patient` DISABLE KEYS */;
INSERT INTO `patient` VALUES ('08d1364a-d211-49f2-b6dc-17ab147312d3','78807ce9-93ad-4771-89b8-88d153b24caf','PAT-2026-0007','Faly Herizo','Andriamanantena','MALE','1982-06-08 00:00:00.000','O+','+261 34 11 222 07','faly.andry@gmail.com','Lot II R 104 Ivato','Antananarivo',NULL,'Proche Andriamanantena','+261 34 11 222 07','Famille proche',NULL,'c3fffe6c-5c60-4d61-b211-0cd45ef335c5',1,NULL,'2026-09-17 08:15:22.890','2026-09-17 08:15:22.890'),('24ca2a35-f2f3-4a82-a70b-4a7f6433f96e','78807ce9-93ad-4771-89b8-88d153b24caf','PAT-2026-0012','Nomena Sophie','Raharimalala','FEMALE','1988-01-27 00:00:00.000','O+','+261 34 11 222 12','sophie.rahary@gmail.com','Lot V D 44 Ambohitrarahaba','Antananarivo',NULL,'Proche Raharimalala','+261 34 11 222 12','Famille proche',NULL,'c3fffe6c-5c60-4d61-b211-0cd45ef335c5',1,NULL,'2026-09-17 08:15:22.908','2026-09-17 08:15:22.908'),('25b45779-9f14-46e1-aaf3-aaab9ec5616d','78807ce9-93ad-4771-89b8-88d153b24caf','PAT-2026-0003','Andry Christian','Rakotomalala','MALE','1992-11-03 00:00:00.000','B+','+261 34 11 222 03','andry.rakoto@gmail.com','Lot III B 78 Itaosy','Antananarivo',NULL,'Proche Rakotomalala','+261 34 11 222 03','Famille proche',NULL,'7a2be79f-448c-455e-ae0d-4c99e51804e9',1,NULL,'2026-09-17 08:15:22.873','2026-09-17 08:15:22.873'),('268c7b61-5dd6-402a-ae66-ff4bf2df3461','78807ce9-93ad-4771-89b8-88d153b24caf','PAT-2026-0005','Toky Nirina','Randrianasolo','MALE','2001-07-30 00:00:00.000','O-','+261 34 11 222 05','toky.randria@outlook.com','Lot I J 33 Talatamaty','Antananarivo',NULL,'Proche Randrianasolo','+261 34 11 222 05','Famille proche',NULL,'46d5d44b-5b92-4c20-9d40-c599448c263a',1,NULL,'2026-09-17 08:15:22.881','2026-09-17 08:15:22.881'),('394da908-e5a9-47c8-a62a-4c178b746d08','78807ce9-93ad-4771-89b8-88d153b24caf','PAT-2026-0002','Marie Thérèse','Razafindrakoto','FEMALE','1985-09-25 00:00:00.000','A+','+261 34 11 222 02','marie.razafy@yahoo.fr','Lot IV F 12 Mahamasina','Antananarivo',NULL,'Proche Razafindrakoto','+261 34 11 222 02','Famille proche',NULL,'c3fffe6c-5c60-4d61-b211-0cd45ef335c5',1,NULL,'2026-09-17 08:15:22.868','2026-09-17 08:15:22.868'),('499da0d5-a58d-4447-9998-e73672895cc7','78807ce9-93ad-4771-89b8-88d153b24caf','PAT-2026-0019','Tahiry Zo','Rabenanahary','MALE','1986-10-29 00:00:00.000','B+','+261 34 11 222 19','tahiry.rabe@gmail.com','Lot V G 63 Alasora','Antananarivo',NULL,'Proche Rabenanahary','+261 34 11 222 19','Famille proche',NULL,'d4c4a47f-31e8-45a0-894d-d40353d7e3dd',1,NULL,'2026-09-17 08:15:22.933','2026-09-17 08:15:22.933'),('6bd52bb4-505f-4799-afb1-00c5dca2e411','78807ce9-93ad-4771-89b8-88d153b24caf','PAT-2026-0018','Miora Hanta','Randrianarisoa','FEMALE','1993-07-21 00:00:00.000','AB+','+261 34 11 222 18','miora.randria@gmail.com','Lot II L 102 Andohalo','Antananarivo',NULL,'Proche Randrianarisoa','+261 34 11 222 18','Famille proche',NULL,'7a2be79f-448c-455e-ae0d-4c99e51804e9',1,NULL,'2026-09-17 08:15:22.929','2026-09-17 08:15:22.929'),('70d2be32-5bd8-4adc-ad6b-584443c35a4b','78807ce9-93ad-4771-89b8-88d153b24caf','PAT-2026-0014','Lova Lalaina','Rakotondrabe','FEMALE','1995-11-15 00:00:00.000','B+','+261 34 11 222 14','lova.rakoto@gmail.com','Lot III T 98 Ankorondrano','Antananarivo',NULL,'Proche Rakotondrabe','+261 34 11 222 14','Famille proche',NULL,'d4c4a47f-31e8-45a0-894d-d40353d7e3dd',1,NULL,'2026-09-17 08:15:22.915','2026-09-17 08:15:22.915'),('8ae11bce-ed45-4f17-967e-86c5c9069732','78807ce9-93ad-4771-89b8-88d153b24caf','PAT-2026-0011','Mikael','Andriantsitohaina','MALE','2019-05-14 00:00:00.000','A+','+261 34 11 222 11','parents.mikael@gmail.com','Lot IV H 71 Isoraka','Antananarivo',NULL,'Proche Andriantsitohaina','+261 34 11 222 11','Famille proche',NULL,'a7a44e6c-e0cc-455c-9303-f5451d71a41a',1,NULL,'2026-09-17 08:15:22.905','2026-09-17 08:15:22.905'),('944bf2ae-12ef-4a7f-b083-815a51a7e3ab','78807ce9-93ad-4771-89b8-88d153b24caf','PAT-2026-0006','Haingo','Ramanandraibe','FEMALE','1990-12-14 00:00:00.000','A-','+261 34 11 222 06','haingo.ram@gmail.com','Lot VI M 50 Sabotsy Namehana','Antananarivo',NULL,'Proche Ramanandraibe','+261 34 11 222 06','Famille proche',NULL,'a7a44e6c-e0cc-455c-9303-f5451d71a41a',1,NULL,'2026-09-17 08:15:22.886','2026-09-17 08:15:22.886'),('97ea7c7c-6c1b-46c0-897b-f4a938ca9bce','78807ce9-93ad-4771-89b8-88d153b24caf','PAT-2026-0001','Jean-Baptiste','Ravalomanana','MALE','1978-04-12 00:00:00.000','O+','+261 34 11 222 01','jb.ravalo@gmail.com','Lot II A 45 Ambohimanarina','Antananarivo',NULL,'Proche Ravalomanana','+261 34 11 222 01','Famille proche',NULL,'a7a44e6c-e0cc-455c-9303-f5451d71a41a',1,NULL,'2026-09-17 08:15:22.862','2026-09-17 08:15:22.862'),('9da709f1-d33d-4d8d-9db8-a1fdcdcec313','78807ce9-93ad-4771-89b8-88d153b24caf','PAT-2026-0013','Didier Patrick','Ratsimbazafy','MALE','1974-09-09 00:00:00.000','A+','+261 34 11 222 13','didier.ratsimba@gmail.com','Lot II N 19 Anosibe','Antananarivo',NULL,'Proche Ratsimbazafy','+261 34 11 222 13','Famille proche',NULL,'7a2be79f-448c-455e-ae0d-4c99e51804e9',1,NULL,'2026-09-17 08:15:22.912','2026-09-17 08:15:22.912'),('b5f562af-344f-4394-81af-f489a4649a9b','78807ce9-93ad-4771-89b8-88d153b24caf','PAT-2026-0009','Roland Guy','Randriamihaja','MALE','1958-10-11 00:00:00.000','AB-','+261 34 11 222 09','roland.randria@blueline.mg','Lot III G 62 Ampandrana','Antananarivo',NULL,'Proche Randriamihaja','+261 34 11 222 09','Famille proche',NULL,'d4c4a47f-31e8-45a0-894d-d40353d7e3dd',1,NULL,'2026-09-17 08:15:22.897','2026-09-17 08:15:22.897'),('c1cac1f1-03df-479a-b1f2-d0785ff5ac87','78807ce9-93ad-4771-89b8-88d153b24caf','PAT-2026-0020','Hantatiana','Ramiandrisoa','FEMALE','1979-05-02 00:00:00.000','O+','+261 34 11 222 20','hanta.ramiandra@gmail.com','Lot III E 55 Ambohipo','Antananarivo',NULL,'Proche Ramiandrisoa','+261 34 11 222 20','Famille proche',NULL,'46d5d44b-5b92-4c20-9d40-c599448c263a',1,NULL,'2026-09-17 08:15:22.936','2026-09-17 08:15:22.936'),('d89c210e-105d-4f56-b039-96f666c8aa32','78807ce9-93ad-4771-89b8-88d153b24caf','PAT-2026-0017','Gérard','Andrianaivoravelo','MALE','1952-03-17 00:00:00.000','O+','+261 34 11 222 17','gerard.andrianaivo@gmail.com','Lot IV X 31 Tsimbazaza','Antananarivo',NULL,'Proche Andrianaivoravelo','+261 34 11 222 17','Famille proche',NULL,'c3fffe6c-5c60-4d61-b211-0cd45ef335c5',1,NULL,'2026-09-17 08:15:22.926','2026-09-17 08:15:22.926'),('ddd25c0b-db5e-442b-9df0-20895449b9d6','78807ce9-93ad-4771-89b8-88d153b24caf','PAT-2026-0008','Sitraka Aina','Rabemananjara','FEMALE','1998-03-22 00:00:00.000','B-','+261 34 11 222 08','sitraka.rabe@gmail.com','Lot VII P 15 Tanjombato','Antananarivo',NULL,'Proche Rabemananjara','+261 34 11 222 08','Famille proche',NULL,'7a2be79f-448c-455e-ae0d-4c99e51804e9',1,NULL,'2026-09-17 08:15:22.894','2026-09-17 08:15:22.894'),('df9627af-c2be-4ccf-888e-d6f8a1064ef9','78807ce9-93ad-4771-89b8-88d153b24caf','PAT-2026-0004','Chantal','Rasoanantenaina','FEMALE','1965-02-18 00:00:00.000','AB+','+261 34 11 222 04','chantal.rasoa@moov.mg','Lot V K 89 Analamahitsy','Antananarivo',NULL,'Proche Rasoanantenaina','+261 34 11 222 04','Famille proche',NULL,'d4c4a47f-31e8-45a0-894d-d40353d7e3dd',1,NULL,'2026-09-17 08:15:22.877','2026-09-17 08:15:22.877'),('ec561022-7d2b-48ef-9607-3e1accecc1ae','78807ce9-93ad-4771-89b8-88d153b24caf','PAT-2026-0010','Eliane','Razanamparany','FEMALE','2005-08-19 00:00:00.000','O+','+261 34 11 222 10','eliane.raza@gmail.com','Lot I F 21 Mandroseza','Antananarivo',NULL,'Proche Razanamparany','+261 34 11 222 10','Famille proche',NULL,'46d5d44b-5b92-4c20-9d40-c599448c263a',1,NULL,'2026-09-17 08:15:22.901','2026-09-17 08:15:22.901'),('f12e5e44-56b1-4d64-9eb4-805f5f53c23f','78807ce9-93ad-4771-89b8-88d153b24caf','PAT-2026-0015','Clément Eric','Rajaonarison','MALE','1969-12-01 00:00:00.000','O+','+261 34 11 222 15','clement.rajao@gmail.com','Lot VI B 14 Ambanidia','Antananarivo',NULL,'Proche Rajaonarison','+261 34 11 222 15','Famille proche',NULL,'46d5d44b-5b92-4c20-9d40-c599448c263a',1,NULL,'2026-09-17 08:15:22.919','2026-09-17 08:15:22.919'),('febc2813-3edf-4ebe-bf17-6cb7056cc64c','78807ce9-93ad-4771-89b8-88d153b24caf','PAT-2026-0016','Volatiana','Razanadrakoto','FEMALE','2003-04-05 00:00:00.000','A-','+261 34 11 222 16','volatiana.raza@gmail.com','Lot I C 80 67 Ha','Antananarivo',NULL,'Proche Razanadrakoto','+261 34 11 222 16','Famille proche',NULL,'a7a44e6c-e0cc-455c-9303-f5451d71a41a',1,NULL,'2026-09-17 08:15:22.923','2026-09-17 08:15:22.923');
/*!40000 ALTER TABLE `patient` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `patientdocument`
--

DROP TABLE IF EXISTS `patientdocument`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patientdocument` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `patientId` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` enum('LAB_REPORT','XRAY_IMAGING','PRESCRIPTION','MEDICAL_CERTIFICATE','DISCHARGE_SUMMARY','OTHER') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'LAB_REPORT',
  `fileUrl` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fileType` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'application/pdf',
  `fileSize` int DEFAULT NULL,
  `uploadedBy` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `PatientDocument_patientId_idx` (`patientId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patientdocument`
--

LOCK TABLES `patientdocument` WRITE;
/*!40000 ALTER TABLE `patientdocument` DISABLE KEYS */;
/*!40000 ALTER TABLE `patientdocument` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment`
--

DROP TABLE IF EXISTS `payment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `paymentNumber` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `invoiceId` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` double NOT NULL,
  `paymentMethod` enum('CASH','MOBILE_MONEY','CREDIT_CARD','BANK_TRANSFER') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'CASH',
  `paymentDate` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `reference` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `receivedById` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Payment_paymentNumber_key` (`paymentNumber`),
  KEY `Payment_invoiceId_idx` (`invoiceId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment`
--

LOCK TABLES `payment` WRITE;
/*!40000 ALTER TABLE `payment` DISABLE KEYS */;
INSERT INTO `payment` VALUES ('3613512b-f5b1-49ff-8a96-9a3363ac1db3','PAY-2026-0102','e2451c5b-b807-4c16-8cf0-9c55b0489e3b',50000,'MOBILE_MONEY','2026-09-17 08:15:23.030','AIRTEL-M-22345','Acompte versé par le patient.',NULL,'2026-09-17 08:15:23.030'),('4cc40d75-2eba-49d5-ae8c-bfcee60b3ce8','PAY-2026-0001','374f66a3-3d17-479a-852b-7659271cf004',35000,'CASH','2026-09-17 08:15:22.972','RECU-CASH-1','Règlement reçu en caisse centrale.',NULL,'2026-09-17 08:15:22.972'),('a009c5db-7d56-491f-add6-eff741c4b761','PAY-2026-0004','77e8fd7c-1eb0-4673-be0d-e6d6d5ff65b0',35000,'MOBILE_MONEY','2026-09-17 08:15:23.017','MVOLA-TX-99883','Règlement reçu en caisse centrale.',NULL,'2026-09-17 08:15:23.017'),('cd2161c1-9180-4ce0-9dca-7ebaf8e8b2eb','PAY-2026-0002','5f863f31-a6a7-4b0c-be99-9bb494655086',35000,'MOBILE_MONEY','2026-09-17 08:15:22.988','MVOLA-TX-99881','Règlement reçu en caisse centrale.',NULL,'2026-09-17 08:15:22.988'),('eeb05312-b4e9-4563-80c9-e9bb425033cf','PAY-2026-0003','69816df8-f42c-4194-b246-ea5cf7e8f643',35000,'CASH','2026-09-17 08:15:23.003','RECU-CASH-3','Règlement reçu en caisse centrale.',NULL,'2026-09-17 08:15:23.003'),('fa10f10b-2e00-473e-b88f-5c3c6f58ea36','PAY-2026-0101','dd5fec70-4026-465f-b8b6-4ba0b7991484',75000,'MOBILE_MONEY','2026-09-17 08:15:23.023','AIRTEL-M-12345','Acompte versé par le patient.',NULL,'2026-09-17 08:15:23.023');
/*!40000 ALTER TABLE `payment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permission`
--

DROP TABLE IF EXISTS `permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permission` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `module` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Permission_code_key` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permission`
--

LOCK TABLES `permission` WRITE;
/*!40000 ALTER TABLE `permission` DISABLE KEYS */;
/*!40000 ALTER TABLE `permission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pharmacysale`
--

DROP TABLE IF EXISTS `pharmacysale`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pharmacysale` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `saleNumber` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `clinicId` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `prescriptionId` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `patientId` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `customerName` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT 'Client de passage',
  `customerPhone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subtotal` double NOT NULL,
  `discount` double NOT NULL DEFAULT '0',
  `total` double NOT NULL,
  `paymentMethod` enum('CASH','MOBILE_MONEY','CREDIT_CARD','BANK_TRANSFER') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'CASH',
  `paymentReference` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('COMPLETED','REFUNDED','CANCELLED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'COMPLETED',
  `saleDate` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `cashierId` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `PharmacySale_saleNumber_key` (`saleNumber`),
  KEY `PharmacySale_clinicId_idx` (`clinicId`),
  KEY `PharmacySale_saleNumber_idx` (`saleNumber`),
  KEY `PharmacySale_saleDate_idx` (`saleDate`),
  KEY `PharmacySale_prescriptionId_fkey` (`prescriptionId`),
  KEY `PharmacySale_patientId_fkey` (`patientId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pharmacysale`
--

LOCK TABLES `pharmacysale` WRITE;
/*!40000 ALTER TABLE `pharmacysale` DISABLE KEYS */;
INSERT INTO `pharmacysale` VALUES ('3bfcd244-2929-4f9f-9b44-dbc8fa3e8300','VTE-2026-0002','78807ce9-93ad-4771-89b8-88d153b24caf',NULL,NULL,'Client de passage',NULL,110000,0,110000,'CASH',NULL,'COMPLETED','2026-09-22 13:47:32.795','afa1413e-5d9c-4eb7-aba2-b3f137183908','2026-09-22 13:47:32.795'),('6308c7c5-323d-426d-a25d-e58f1e7765fa','VTE-2026-0006','78807ce9-93ad-4771-89b8-88d153b24caf',NULL,NULL,'Client de passage',NULL,32000,0,32000,'CASH',NULL,'COMPLETED','2026-09-23 06:40:37.091','6661fa07-e61e-47cc-be9c-a0ef8d8e28a6','2026-09-23 06:40:37.091'),('824993cf-dcf0-44e1-a4a4-870f0215c184','VTE-2026-0001','78807ce9-93ad-4771-89b8-88d153b24caf',NULL,NULL,'Jean-Baptiste Ravalomanana','+261 34 11 222 01',17000,0,17000,'CASH',NULL,'COMPLETED','2026-09-17 08:15:23.040',NULL,'2026-09-17 08:15:23.040'),('8c337884-1b06-4c74-8a56-ed30dcd49bbe','VTE-2026-0005','78807ce9-93ad-4771-89b8-88d153b24caf',NULL,NULL,'Client de passage',NULL,32000,0,32000,'MOBILE_MONEY',NULL,'COMPLETED','2026-09-22 14:20:07.935','6661fa07-e61e-47cc-be9c-a0ef8d8e28a6','2026-09-22 14:20:07.935'),('91b43f70-765e-49c6-a9cf-6a017149ffe0','VTE-2026-0003','78807ce9-93ad-4771-89b8-88d153b24caf',NULL,NULL,'Client de passage',NULL,12500,0,12500,'CASH',NULL,'COMPLETED','2026-09-22 14:14:46.958','afa1413e-5d9c-4eb7-aba2-b3f137183908','2026-09-22 14:14:46.958'),('ddca79d6-6898-4b8d-b55a-ddda8759f54e','VTE-2026-0004','78807ce9-93ad-4771-89b8-88d153b24caf',NULL,NULL,'Client de passage',NULL,32000,0,32000,'CASH',NULL,'COMPLETED','2026-09-22 14:15:46.700','6661fa07-e61e-47cc-be9c-a0ef8d8e28a6','2026-09-22 14:15:46.700');
/*!40000 ALTER TABLE `pharmacysale` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pharmacysaleitem`
--

DROP TABLE IF EXISTS `pharmacysaleitem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pharmacysaleitem` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pharmacySaleId` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `medicineId` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `medicineName` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` int NOT NULL,
  `unitPrice` double NOT NULL,
  `totalPrice` double NOT NULL,
  PRIMARY KEY (`id`),
  KEY `PharmacySaleItem_pharmacySaleId_idx` (`pharmacySaleId`),
  KEY `PharmacySaleItem_medicineId_idx` (`medicineId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pharmacysaleitem`
--

LOCK TABLES `pharmacysaleitem` WRITE;
/*!40000 ALTER TABLE `pharmacysaleitem` DISABLE KEYS */;
INSERT INTO `pharmacysaleitem` VALUES ('0c10d730-25b2-4b28-a862-f64b19536f08','3bfcd244-2929-4f9f-9b44-dbc8fa3e8300','2126b7f2-4135-4856-8cb5-e96a9adfdf27','Amoxicilline Biogaran 500 mg',1,12500,12500),('1c420ed7-6d41-4f23-b37b-696ce4d3562c','824993cf-dcf0-44e1-a4a4-870f0215c184','cad697cd-38ab-476e-8a7f-27804ad5e165','Ibuprofène 400 mg',1,7000,7000),('244cdba5-843b-41e8-a006-5877cc9edb03','3bfcd244-2929-4f9f-9b44-dbc8fa3e8300','ec55f4d6-5e0f-46b6-9390-2e53b8f82430','Co-Aprovel 150/12.5 mg',1,39000,39000),('382f8496-ef81-4d56-968a-f63f3d4b7ddc','3bfcd244-2929-4f9f-9b44-dbc8fa3e8300','29ee2757-483f-4ae3-a859-aec2beeb9d6a','Artésunate Injectable 60 mg',1,26000,26000),('3e72d000-e07a-46ea-af4f-5b370ad8d271','3bfcd244-2929-4f9f-9b44-dbc8fa3e8300','4e83e6e0-29fb-4924-80f1-92d36efe23f7','Bévitine B1-B6',1,10500,10500),('61a5b569-37a4-4216-8ccb-74e088f8be87','824993cf-dcf0-44e1-a4a4-870f0215c184','a841ead1-63c6-4ba3-88b0-201b3efbc6d9','Doliprane 1000 mg',2,5000,10000),('73ce84a1-5f2e-4858-bbdd-33d1278388b4','ddca79d6-6898-4b8d-b55a-ddda8759f54e','db124791-ec1b-4cf7-929b-49ed19b59f23','Augmentin 1 g / 125 mg',1,32000,32000),('7ebb7f74-8107-4bca-a56b-85d737a828a2','91b43f70-765e-49c6-a9cf-6a017149ffe0','2126b7f2-4135-4856-8cb5-e96a9adfdf27','Amoxicilline Biogaran 500 mg',1,12500,12500),('ad7dd4c8-0072-495e-a195-9ebc88d1bdd5','6308c7c5-323d-426d-a25d-e58f1e7765fa','db124791-ec1b-4cf7-929b-49ed19b59f23','Augmentin 1 g / 125 mg',1,32000,32000),('d947fe3c-40ee-46f9-b760-b7d119003dba','3bfcd244-2929-4f9f-9b44-dbc8fa3e8300','4157cc21-7340-490a-84d9-b8812b144a00','Azithromycine 500 mg',1,22000,22000),('e6b73c98-2afc-40cd-8d95-94f3f6508047','8c337884-1b06-4c74-8a56-ed30dcd49bbe','db124791-ec1b-4cf7-929b-49ed19b59f23','Augmentin 1 g / 125 mg',1,32000,32000);
/*!40000 ALTER TABLE `pharmacysaleitem` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prescription`
--

DROP TABLE IF EXISTS `prescription`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prescription` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `prescriptionNumber` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `patientId` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `doctorId` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `consultationId` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('ACTIVE','DISPENSED','CANCELLED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `qrCode` text COLLATE utf8mb4_unicode_ci,
  `doctorNotes` text COLLATE utf8mb4_unicode_ci,
  `validUntil` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Prescription_prescriptionNumber_key` (`prescriptionNumber`),
  UNIQUE KEY `Prescription_consultationId_key` (`consultationId`),
  KEY `Prescription_patientId_idx` (`patientId`),
  KEY `Prescription_doctorId_idx` (`doctorId`),
  KEY `Prescription_prescriptionNumber_idx` (`prescriptionNumber`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prescription`
--

LOCK TABLES `prescription` WRITE;
/*!40000 ALTER TABLE `prescription` DISABLE KEYS */;
INSERT INTO `prescription` VALUES ('11a1ca76-17cc-419a-ae71-7186366be3b0','ORD-2026-0004','08d1364a-d211-49f2-b6dc-17ab147312d3','46d5d44b-5b92-4c20-9d40-c599448c263a','0b8be551-dfae-4b16-9290-ba9cd835e34d','ACTIVE','https://myclinique.mg/verify/rx/ORD-2026-0004','Prendre les médicaments selon la posologie stricte indiquée.','2026-10-17 08:15:22.996','2026-09-17 08:15:23.009','2026-09-17 08:15:23.009'),('1ed79f0f-2681-4668-b3f4-e06e9762e3d9','ORD-2026-0003','df9627af-c2be-4ccf-888e-d6f8a1064ef9','a7a44e6c-e0cc-455c-9303-f5451d71a41a','77b85595-0238-4dcf-9782-7724a6f84215','ACTIVE','https://myclinique.mg/verify/rx/ORD-2026-0003','Prendre les médicaments selon la posologie stricte indiquée.','2026-10-17 08:15:22.982','2026-09-17 08:15:22.995','2026-09-17 08:15:22.995'),('9b91bc0e-0982-4dc1-a51a-2447f6aee494','ORD-2026-0001','97ea7c7c-6c1b-46c0-897b-f4a938ca9bce','a7a44e6c-e0cc-455c-9303-f5451d71a41a','182333fc-6bb7-4513-9948-4eb43fbef38a','ACTIVE','https://myclinique.mg/verify/rx/ORD-2026-0001','Prendre les médicaments selon la posologie stricte indiquée.','2026-10-17 08:15:22.946','2026-09-17 08:15:22.959','2026-09-17 08:15:22.959'),('c233a642-3fb7-425d-a9e1-5846848edc3e','ORD-2026-0002','394da908-e5a9-47c8-a62a-4c178b746d08','c3fffe6c-5c60-4d61-b211-0cd45ef335c5','4ceaeb70-6468-4ce1-99d9-d4c115b1286a','ACTIVE','https://myclinique.mg/verify/rx/ORD-2026-0002','Prendre les médicaments selon la posologie stricte indiquée.','2026-10-17 08:15:22.967','2026-09-17 08:15:22.980','2026-09-17 08:15:22.980');
/*!40000 ALTER TABLE `prescription` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prescriptionitem`
--

DROP TABLE IF EXISTS `prescriptionitem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prescriptionitem` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `prescriptionId` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `medicineId` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `medicineName` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `dosage` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `form` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `frequency` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `duration` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `route` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'Voie orale',
  `instructions` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `PrescriptionItem_prescriptionId_idx` (`prescriptionId`),
  KEY `PrescriptionItem_medicineId_fkey` (`medicineId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prescriptionitem`
--

LOCK TABLES `prescriptionitem` WRITE;
/*!40000 ALTER TABLE `prescriptionitem` DISABLE KEYS */;
INSERT INTO `prescriptionitem` VALUES ('008a01e8-9daf-452c-b0fd-86dd3541aebf','1ed79f0f-2681-4668-b3f4-e06e9762e3d9','edd29656-8f28-4ec7-b38b-965082b3b191','Tahor 20 mg','20 mg','Comprimé pelliculé',2,'1 comprimé matin et soir','Pendant 7 jours','Voie orale','À prendre au milieu des repas avec un grand verre d’eau.'),('18147088-6256-48b9-ad10-fb7c2c83c164','9b91bc0e-0982-4dc1-a51a-2447f6aee494','cad697cd-38ab-476e-8a7f-27804ad5e165','Ibuprofène 400 mg','400 mg','Comprimé',2,'1 comprimé matin et soir','Pendant 7 jours','Voie orale','À prendre au milieu des repas avec un grand verre d’eau.'),('1902e15d-a91f-41e2-854a-f7dd4e7a6f78','c233a642-3fb7-425d-a9e1-5846848edc3e','4e83e6e0-29fb-4924-80f1-92d36efe23f7','Bévitine B1-B6','250 mg','Comprimé',2,'1 comprimé matin et soir','Pendant 7 jours','Voie orale','À prendre au milieu des repas avec un grand verre d’eau.'),('1d97188d-6e57-49a7-b80e-45c9ae6bf55d','11a1ca76-17cc-419a-ae71-7186366be3b0','8c7e83b3-f43a-491e-8c17-e358479d3b8a','Fucidine 2%','2%','Tube crème 15 g',2,'1 comprimé matin et soir','Pendant 7 jours','Voie orale','À prendre au milieu des repas avec un grand verre d’eau.'),('2a92defa-84cd-4846-89c8-e9dd44ca3c78','9b91bc0e-0982-4dc1-a51a-2447f6aee494','a841ead1-63c6-4ba3-88b0-201b3efbc6d9','Doliprane 1000 mg','1000 mg','Comprimé',2,'1 comprimé matin et soir','Pendant 7 jours','Voie orale','À prendre au milieu des repas avec un grand verre d’eau.'),('43f518be-b212-45f0-961e-4b51671bcb7f','c233a642-3fb7-425d-a9e1-5846848edc3e','768161bd-2b7c-457e-a149-8e2593651c8c','Vitamine C 1000 mg','1000 mg','Tube effervescent',2,'1 comprimé matin et soir','Pendant 7 jours','Voie orale','À prendre au milieu des repas avec un grand verre d’eau.'),('688f3026-f04b-4b94-9ad7-171dadfebe14','11a1ca76-17cc-419a-ae71-7186366be3b0','690b9396-38ce-4642-8c42-3c19a75450a0','Bétadine Dermique 10%','10%','Flacon 125 ml',2,'1 comprimé matin et soir','Pendant 7 jours','Voie orale','À prendre au milieu des repas avec un grand verre d’eau.'),('f5aa199a-ca97-42c0-83d0-1b2409a6503c','1ed79f0f-2681-4668-b3f4-e06e9762e3d9','1b5aafc1-92b8-4202-9cd9-e9470e463771','Amlodipine 5 mg','5 mg','Gélule',2,'1 comprimé matin et soir','Pendant 7 jours','Voie orale','À prendre au milieu des repas avec un grand verre d’eau.');
/*!40000 ALTER TABLE `prescriptionitem` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role`
--

DROP TABLE IF EXISTS `role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` enum('SUPER_ADMIN','CLINIC_ADMIN','DOCTOR','NURSE','PHARMACIST','RECEPTIONIST','ACCOUNTANT') COLLATE utf8mb4_unicode_ci NOT NULL,
  `displayName` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Role_name_key` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role`
--

LOCK TABLES `role` WRITE;
/*!40000 ALTER TABLE `role` DISABLE KEYS */;
INSERT INTO `role` VALUES ('157863b5-6b54-4d83-8c20-1acea7785667','DOCTOR','Médecin Praticien','Consultations, dossiers médicaux, prescriptions, agenda','2026-09-17 08:14:48.749','2026-09-17 08:15:22.587'),('6491f15c-7aa6-4e53-a57b-9c26f8c3ceed','NURSE','Infirmier(ère)','Prise des constantes, accueil médical, assistance soins','2026-09-17 08:14:48.752','2026-09-17 08:15:22.590'),('7d3a6eec-f4f0-43b5-a197-005f1ebd5d68','CLINIC_ADMIN','Administrateur Clinique','Gestion globale de l’établissement, utilisateurs et finances','2026-09-17 08:14:48.746','2026-09-17 08:15:22.585'),('a19b6a38-302d-4cc2-8e5d-5a4435b142e0','ACCOUNTANT','Comptable','Facturation, encaissements, impayés et journal de caisse','2026-09-17 08:14:48.761','2026-09-17 08:15:22.596'),('c1703311-a9cd-4e8c-8009-56e632d1814c','SUPER_ADMIN','Super Administrateur','Accès global absolu à tous les modules et configurations','2026-09-17 08:14:48.740','2026-09-17 08:15:22.578'),('e8fa231e-7a16-4753-bb49-0e0dfb82be9f','RECEPTIONIST','Réceptionniste','Accueil des patients, gestion des rendez-vous et file d’attente','2026-09-17 08:14:48.757','2026-09-17 08:15:22.594'),('f384fc67-9643-432f-9578-162e06ed08de','PHARMACIST','Pharmacien','Gestion de la pharmacie, stocks, ventes POS, réapprovisionnement','2026-09-17 08:14:48.755','2026-09-17 08:15:22.592');
/*!40000 ALTER TABLE `role` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rolepermission`
--

DROP TABLE IF EXISTS `rolepermission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rolepermission` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `roleId` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `permissionId` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `RolePermission_roleId_permissionId_key` (`roleId`,`permissionId`),
  KEY `RolePermission_permissionId_fkey` (`permissionId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rolepermission`
--

LOCK TABLES `rolepermission` WRITE;
/*!40000 ALTER TABLE `rolepermission` DISABLE KEYS */;
/*!40000 ALTER TABLE `rolepermission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `setting`
--

DROP TABLE IF EXISTS `setting`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `setting` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `clinicId` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `key` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'general',
  `isPublic` tinyint(1) NOT NULL DEFAULT '0',
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Setting_clinicId_key_key` (`clinicId`,`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `setting`
--

LOCK TABLES `setting` WRITE;
/*!40000 ALTER TABLE `setting` DISABLE KEYS */;
INSERT INTO `setting` VALUES ('105e21ed-63d8-48ad-ad4e-9fd6feb13675','78807ce9-93ad-4771-89b8-88d153b24caf','invoice_footer','Règlement à réception. Tout retard entraîne des pénalités légales.','custom',0,'2026-09-17 08:33:46.160'),('4acbb4eb-d6bd-48bd-bf3a-9e1cab4700dc','78807ce9-93ad-4771-89b8-88d153b24caf','opening_hours','Lundi - Vendredi: 07h30 - 18h00 | Samedi: 08h00 - 12h00','custom',0,'2026-09-17 08:33:46.150'),('9f9c1f7c-89c9-4e56-b104-f072cd68c48e','78807ce9-93ad-4771-89b8-88d153b24caf','prescription_footer','Ordonnance médicale strictement personnelle. Ne pas dépasser la posologie prescrite.','custom',0,'2026-09-17 08:33:46.156'),('abcfc44f-ab07-433c-b775-1001e9b766fc','78807ce9-93ad-4771-89b8-88d153b24caf','emergency_phone','+261 34 00 000 01','custom',0,'2026-09-17 08:33:46.154'),('dc957600-c468-488e-be80-33a7560e2a2c','78807ce9-93ad-4771-89b8-88d153b24caf','consultation_duration','30','custom',0,'2026-09-17 08:33:46.143');
/*!40000 ALTER TABLE `setting` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `specialty`
--

DROP TABLE IF EXISTS `specialty`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `specialty` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Specialty_name_key` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `specialty`
--

LOCK TABLES `specialty` WRITE;
/*!40000 ALTER TABLE `specialty` DISABLE KEYS */;
INSERT INTO `specialty` VALUES ('2a7f3f44-8f4d-4c9e-9a1d-fe5c61bdef7f','Médecine Générale','Soins primaires et suivi global des patients','2026-09-17 08:14:48.872'),('670280ae-50ba-4330-a0d6-0d21cd5418f9','Cardiologie','Maladies du cœur et du système cardiovasculaire','2026-09-17 08:14:48.878'),('8c2da999-d4ec-4b62-8285-0f1b7d7db48c','Ophtalmologie','Soins et chirurgie des yeux et de la vision','2026-09-17 08:14:48.890'),('8c3f132a-0709-491c-9eae-19bf23a7071e','Dermatologie','Affections de la peau, des muqueuses et des phanères','2026-09-17 08:14:48.887'),('c1d325cd-a0ce-4e8a-bb8a-132a22c57a71','Gynécologie-Obstétrique','Santé féminine, suivi de grossesse et accouchements','2026-09-17 08:14:48.884'),('d2c955e5-3fcf-4e74-b5ab-f28c168f9c3a','Pédiatrie','Santé et développement des enfants et nourrissons','2026-09-17 08:14:48.881');
/*!40000 ALTER TABLE `specialty` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stockentry`
--

DROP TABLE IF EXISTS `stockentry`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stockentry` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `medicineId` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `supplierId` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quantity` int NOT NULL,
  `unitCost` double NOT NULL,
  `totalCost` double NOT NULL,
  `batchNumber` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `expiryDate` datetime(3) DEFAULT NULL,
  `entryDate` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `notes` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdById` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `StockEntry_medicineId_idx` (`medicineId`),
  KEY `StockEntry_supplierId_idx` (`supplierId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stockentry`
--

LOCK TABLES `stockentry` WRITE;
/*!40000 ALTER TABLE `stockentry` DISABLE KEYS */;
/*!40000 ALTER TABLE `stockentry` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stockexit`
--

DROP TABLE IF EXISTS `stockexit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stockexit` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `medicineId` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` int NOT NULL,
  `reason` enum('EXPIRED','DAMAGED','INVENTORY_ADJUSTMENT','RETURN_TO_SUPPLIER','OTHER') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'EXPIRED',
  `exitDate` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `notes` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdById` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `StockExit_medicineId_idx` (`medicineId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stockexit`
--

LOCK TABLES `stockexit` WRITE;
/*!40000 ALTER TABLE `stockexit` DISABLE KEYS */;
/*!40000 ALTER TABLE `stockexit` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `supplier`
--

DROP TABLE IF EXISTS `supplier`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `supplier` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `clinicId` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contactPerson` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `taxId` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Supplier_clinicId_idx` (`clinicId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `supplier`
--

LOCK TABLES `supplier` WRITE;
/*!40000 ALTER TABLE `supplier` DISABLE KEYS */;
INSERT INTO `supplier` VALUES ('0765ef6a-c982-42a3-845a-c5c0f71f3d9c','78807ce9-93ad-4771-89b8-88d153b24caf','Sodipharm Madagascar','Dr. Lalao R.','+261 20 22 678 90','contact@sodipharm.mg','Tanjombato, Antananarivo',NULL,NULL,'2026-09-17 08:15:22.761','2026-09-17 08:15:22.761'),('28d66c3b-f039-4558-abb7-3cc426bd8949','78807ce9-93ad-4771-89b8-88d153b24caf','Laborex Océan Indien','M. Jean-Paul','+261 20 22 411 22','laborex@laborex-oi.com','Andraharo, Antananarivo',NULL,NULL,'2026-09-17 08:15:22.763','2026-09-17 08:15:22.763'),('2914efeb-5f99-4e34-8254-4f560c37f313','78807ce9-93ad-4771-89b8-88d153b24caf','MediSupply International','Mme Carole','+261 20 22 899 00','info@medisupply.mg','Ivato, Antananarivo',NULL,NULL,'2026-09-17 08:15:22.764','2026-09-17 08:15:22.764'),('bf5e8ad7-eaed-4c03-9fca-f5394bc1cc4b','78807ce9-93ad-4771-89b8-88d153b24caf','Pharmapro Distribution','M. Eric Rajaona','+261 20 22 345 67','commandes@pharmapro.mg','Ankorondrano, Antananarivo',NULL,NULL,'2026-09-17 08:15:22.759','2026-09-17 08:15:22.759'),('e2c8a112-8e62-475a-86e4-ef61fdff3b22','78807ce9-93ad-4771-89b8-88d153b24caf','SALAMA Madagascar','Mme Voahangy','+261 20 22 250 11','salama@salama.mg','Anosivavaka, Antananarivo',NULL,NULL,'2026-09-17 08:15:22.756','2026-09-17 08:15:22.756');
/*!40000 ALTER TABLE `supplier` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `passwordHash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `firstName` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lastName` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `lastLoginAt` datetime(3) DEFAULT NULL,
  `clinicId` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `roleId` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_email_key` (`email`),
  KEY `User_email_idx` (`email`),
  KEY `User_clinicId_idx` (`clinicId`),
  KEY `User_roleId_fkey` (`roleId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES ('1459db5c-8478-4c20-b243-5d1902a239e1','dr.claire@myclinique.com','$2a$10$3vSMAT6G.oWx8VEUigPhlesDCooVljDr5bEwPVVwhagNpnsLmCB/O','Claire','Ramanantsoa','+261 34 02 444 04','https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',1,NULL,'78807ce9-93ad-4771-89b8-88d153b24caf','157863b5-6b54-4d83-8c20-1acea7785667','2026-09-17 08:14:48.930','2026-09-17 08:14:48.930'),('2d2fb2d5-b5de-48a8-9d05-2b4d083c569e','dr.andry@myclinique.com','$2a$10$3vSMAT6G.oWx8VEUigPhlesDCooVljDr5bEwPVVwhagNpnsLmCB/O','Aina','Andry','+261 34 02 444 03','https://images.unsplash.com/photo-1594824813689-f52f36d4f9b8?w=150&auto=format&fit=crop&q=80',1,NULL,'78807ce9-93ad-4771-89b8-88d153b24caf','157863b5-6b54-4d83-8c20-1acea7785667','2026-09-17 08:14:48.923','2026-09-17 08:14:48.923'),('3f42c72f-72c4-40c7-ba8a-7d011b49ec8f','reception@myclinique.com','$2a$10$3vSMAT6G.oWx8VEUigPhlesDCooVljDr5bEwPVVwhagNpnsLmCB/O','Fanja','Rabary','+261 34 03 555 03','https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',1,'2026-10-08 16:51:32.295','78807ce9-93ad-4771-89b8-88d153b24caf','e8fa231e-7a16-4753-bb49-0e0dfb82be9f','2026-09-17 08:14:48.949','2026-10-08 16:51:32.298'),('48d5279b-a6d7-41ba-a52b-2a84f6a9e5ac','infirmier@myclinique.com','$2a$10$3vSMAT6G.oWx8VEUigPhlesDCooVljDr5bEwPVVwhagNpnsLmCB/O','Sarah','Rasoa','+261 34 03 555 01','https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=150&auto=format&fit=crop&q=80',1,NULL,'78807ce9-93ad-4771-89b8-88d153b24caf','6491f15c-7aa6-4e53-a57b-9c26f8c3ceed','2026-09-17 08:14:48.942','2026-09-17 08:14:48.942'),('56e6d726-3180-4ea5-a606-aeebed069975','dr.rakoto@myclinique.com','$2a$10$3vSMAT6G.oWx8VEUigPhlesDCooVljDr5bEwPVVwhagNpnsLmCB/O','Hery','Rakoto','+261 34 02 444 02','https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80',1,NULL,'78807ce9-93ad-4771-89b8-88d153b24caf','157863b5-6b54-4d83-8c20-1acea7785667','2026-09-17 08:14:48.917','2026-09-17 08:14:48.917'),('6661fa07-e61e-47cc-be9c-a0ef8d8e28a6','dr.dupont@myclinique.com','$2a$10$3vSMAT6G.oWx8VEUigPhlesDCooVljDr5bEwPVVwhagNpnsLmCB/O','Jean','Dupont','+261 34 02 444 01','https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',1,'2026-09-23 07:08:31.846','78807ce9-93ad-4771-89b8-88d153b24caf','157863b5-6b54-4d83-8c20-1acea7785667','2026-09-17 08:14:48.906','2026-09-23 07:08:31.847'),('86e2efbd-f1af-4975-9b60-20b714be11be','dr.michel@myclinique.com','$2a$10$3vSMAT6G.oWx8VEUigPhlesDCooVljDr5bEwPVVwhagNpnsLmCB/O','Michel','Razafy','+261 34 02 444 05','https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&auto=format&fit=crop&q=80',1,NULL,'78807ce9-93ad-4771-89b8-88d153b24caf','157863b5-6b54-4d83-8c20-1acea7785667','2026-09-17 08:14:48.936','2026-09-17 08:14:48.936'),('8970749f-92ff-4553-b2c6-e47e17253211','pharmacien@myclinique.com','$2a$10$3vSMAT6G.oWx8VEUigPhlesDCooVljDr5bEwPVVwhagNpnsLmCB/O','Tahina','Randria','+261 34 03 555 02','https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=150&auto=format&fit=crop&q=80',1,'2026-09-23 12:41:00.665','78807ce9-93ad-4771-89b8-88d153b24caf','f384fc67-9643-432f-9578-162e06ed08de','2026-09-17 08:14:48.946','2026-09-23 12:41:00.669'),('8bc7430c-2896-4619-8939-e5f274eff2b3','admin.clinique@myclinique.com','$2a$10$3vSMAT6G.oWx8VEUigPhlesDCooVljDr5bEwPVVwhagNpnsLmCB/O','Béatrice','Andrianina','+261 34 00 111 01',NULL,1,NULL,'78807ce9-93ad-4771-89b8-88d153b24caf','7d3a6eec-f4f0-43b5-a197-005f1ebd5d68','2026-09-17 08:14:48.902','2026-09-17 08:14:48.902'),('afa1413e-5d9c-4eb7-aba2-b3f137183908','admin@myclinique.com','$2a$10$3vSMAT6G.oWx8VEUigPhlesDCooVljDr5bEwPVVwhagNpnsLmCB/O','Alexandre','Dumas','+261 34 00 111 00','https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',1,'2026-10-08 16:51:59.422','78807ce9-93ad-4771-89b8-88d153b24caf','c1703311-a9cd-4e8c-8009-56e632d1814c','2026-09-17 08:14:48.895','2026-10-08 16:51:59.425'),('d4f53f53-7517-479d-b063-49262c248c4c','comptable@myclinique.com','$2a$10$3vSMAT6G.oWx8VEUigPhlesDCooVljDr5bEwPVVwhagNpnsLmCB/O','Mamy','Ralison','+261 34 03 555 04','https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',1,NULL,'78807ce9-93ad-4771-89b8-88d153b24caf','a19b6a38-302d-4cc2-8e5d-5a4435b142e0','2026-09-17 08:14:48.953','2026-09-17 08:14:48.953');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vitalsign`
--

DROP TABLE IF EXISTS `vitalsign`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vitalsign` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `consultationId` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `temperature` double DEFAULT NULL,
  `systolicBP` int DEFAULT NULL,
  `diastolicBP` int DEFAULT NULL,
  `heartRate` int DEFAULT NULL,
  `oxygenSaturation` double DEFAULT NULL,
  `weight` double DEFAULT NULL,
  `height` double DEFAULT NULL,
  `bmi` double DEFAULT NULL,
  `measuredAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `VitalSign_consultationId_key` (`consultationId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vitalsign`
--

LOCK TABLES `vitalsign` WRITE;
/*!40000 ALTER TABLE `vitalsign` DISABLE KEYS */;
INSERT INTO `vitalsign` VALUES ('36ea4534-9eb9-4f69-ac79-04ee1faac7c7','0b8be551-dfae-4b16-9290-ba9cd835e34d',36.7,120,80,68,99,78,178,24.6,'2026-09-17 08:15:23.008'),('4f801444-c681-461b-ad4c-1086d62395d5','182333fc-6bb7-4513-9948-4eb43fbef38a',36.8,130,82,72,99,74,172,25,'2026-09-17 08:15:22.956'),('c320278e-c086-484c-bff1-e0490eb5ba97','77b85595-0238-4dcf-9782-7724a6f84215',36.9,135,85,76,97.5,82,160,32,'2026-09-17 08:15:22.993'),('d499508a-04ca-4aba-870b-859c930402a2','4ceaeb70-6468-4ce1-99d9-d4c115b1286a',37.1,125,78,88,98,62,165,22.8,'2026-09-17 08:15:22.979');
/*!40000 ALTER TABLE `vitalsign` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-08 19:40:39
