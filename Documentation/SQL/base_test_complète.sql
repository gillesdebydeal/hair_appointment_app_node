-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: hair_appointment
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `audit_log`
--

DROP TABLE IF EXISTS `audit_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_log` (
  `id_audit` int NOT NULL AUTO_INCREMENT,
  `id_user` int DEFAULT NULL,
  `action` varchar(255) NOT NULL,
  `table_cible` varchar(100) NOT NULL,
  `id_cible` int DEFAULT NULL,
  `donnees_avant` json DEFAULT NULL,
  `donnees_apres` json DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text,
  `date_action` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_audit`),
  KEY `id_user` (`id_user`),
  CONSTRAINT `audit_log_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `user` (`id_user`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_log`
--

LOCK TABLES `audit_log` WRITE;
/*!40000 ALTER TABLE `audit_log` DISABLE KEYS */;
/*!40000 ALTER TABLE `audit_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `avis`
--

DROP TABLE IF EXISTS `avis`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `avis` (
  `id_avis` int NOT NULL AUTO_INCREMENT,
  `id_client` int NOT NULL,
  `id_business_user` int DEFAULT NULL,
  `id_reservation` int DEFAULT NULL,
  `note` tinyint NOT NULL,
  `commentaire` text,
  `consentement_client_affichage` tinyint(1) DEFAULT '0',
  `autorisation_prestataire_affichage` tinyint(1) DEFAULT '0',
  `reponse_prestataire` text,
  `date_creation` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `visible` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id_avis`),
  KEY `id_client` (`id_client`),
  KEY `id_business_user` (`id_business_user`),
  KEY `id_reservation` (`id_reservation`),
  CONSTRAINT `avis_ibfk_1` FOREIGN KEY (`id_client`) REFERENCES `user` (`id_user`) ON DELETE CASCADE,
  CONSTRAINT `avis_ibfk_2` FOREIGN KEY (`id_business_user`) REFERENCES `business_user` (`id_business_user`) ON DELETE SET NULL,
  CONSTRAINT `avis_ibfk_3` FOREIGN KEY (`id_reservation`) REFERENCES `reservation` (`id_reservation`) ON DELETE SET NULL,
  CONSTRAINT `avis_chk_1` CHECK ((`note` between 1 and 5))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `avis`
--

LOCK TABLES `avis` WRITE;
/*!40000 ALTER TABLE `avis` DISABLE KEYS */;
/*!40000 ALTER TABLE `avis` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `business`
--

DROP TABLE IF EXISTS `business`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `business` (
  `id_business` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(255) NOT NULL,
  `description` text,
  `siret` varchar(14) DEFAULT NULL,
  `email_contact` varchar(255) DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `telephone` varchar(20) DEFAULT NULL,
  `adresse` varchar(255) DEFAULT NULL,
  `ville` varchar(100) DEFAULT NULL,
  `code_postal` varchar(10) DEFAULT NULL,
  `pays` varchar(100) DEFAULT 'France',
  `id_admin` int DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `actif` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id_business`),
  KEY `id_admin` (`id_admin`),
  CONSTRAINT `business_ibfk_1` FOREIGN KEY (`id_admin`) REFERENCES `user` (`id_user`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `business`
--

LOCK TABLES `business` WRITE;
/*!40000 ALTER TABLE `business` DISABLE KEYS */;
INSERT INTO `business` VALUES (1,'Hair Appointment - Villefranche',NULL,NULL,'contact@hairappointment.com',NULL,NULL,NULL,'25, rue de la république','Villefranche s/Saône','69400','France',1,NULL,1),(2,'Hair Appointment -  Paris',NULL,NULL,'paris@hairapp.test',48.85660000,2.35220000,'0101010101','10 Rue de Rivoli','Paris','75001','France',NULL,NULL,1),(3,'Hair Appointment - Lyon',NULL,NULL,'lyon@hairapp.test',45.76400000,4.83570000,'0404040404','15 Place Bellecour','Lyon','69002','France',NULL,NULL,1),(4,'Hair Appointment - Marseille',NULL,NULL,'marseille@hairapp.test',43.29650000,5.36980000,'0491919191','1 Quai du Port','Marseille','13002','France',NULL,NULL,1),(5,'Hair Appointment - Bordeaux',NULL,NULL,'bordeaux@hairapp.test',44.83780000,-0.57920000,'0556565656','20 Rue Sainte-Catherine','Bordeaux','33000','France',NULL,NULL,1),(6,'Hair Appointment - Lille',NULL,NULL,'lille@hairapp.test',50.62920000,3.05730000,'0320202020','5 Grand Place','Lille','59000','France',NULL,NULL,1);
/*!40000 ALTER TABLE `business` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `business_evenement_exceptionnel`
--

DROP TABLE IF EXISTS `business_evenement_exceptionnel`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `business_evenement_exceptionnel` (
  `id_fermeture` int NOT NULL AUTO_INCREMENT,
  `id_business` int NOT NULL,
  `type_evenement` enum('FERMETURE','OUVERTURE') NOT NULL DEFAULT 'FERMETURE',
  `date_debut` datetime NOT NULL,
  `date_fin` datetime NOT NULL,
  `motif` varchar(255) DEFAULT NULL,
  `recurrence` enum('unique','annuelle') DEFAULT NULL,
  `heure_ouverture` time DEFAULT NULL,
  `heure_fermeture` time DEFAULT NULL,
  `pause_debut` time DEFAULT NULL,
  `pause_fin` time DEFAULT NULL,
  PRIMARY KEY (`id_fermeture`),
  KEY `id_business` (`id_business`),
  CONSTRAINT `business_evenement_exceptionnel_ibfk_1` FOREIGN KEY (`id_business`) REFERENCES `business` (`id_business`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `business_evenement_exceptionnel`
--

LOCK TABLES `business_evenement_exceptionnel` WRITE;
/*!40000 ALTER TABLE `business_evenement_exceptionnel` DISABLE KEYS */;
INSERT INTO `business_evenement_exceptionnel` VALUES (1,1,'FERMETURE','2025-12-25 00:00:00','2025-12-25 00:00:00','Fermeture jour de Noël',NULL,NULL,NULL,NULL,NULL),(2,1,'FERMETURE','2026-01-01 00:00:00','2026-01-01 00:00:00','Fermeture jour de l\'An 2026',NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `business_evenement_exceptionnel` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `business_horaires`
--

DROP TABLE IF EXISTS `business_horaires`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `business_horaires` (
  `id_horaire` int NOT NULL AUTO_INCREMENT,
  `id_business` int NOT NULL,
  `jour_semaine` tinyint NOT NULL,
  `heure_ouverture` time NOT NULL,
  `heure_fermeture` time NOT NULL,
  `pause_debut` time DEFAULT NULL,
  `pause_fin` time DEFAULT NULL,
  `actif` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id_horaire`),
  UNIQUE KEY `id_business` (`id_business`,`jour_semaine`),
  CONSTRAINT `business_horaires_ibfk_1` FOREIGN KEY (`id_business`) REFERENCES `business` (`id_business`) ON DELETE CASCADE,
  CONSTRAINT `business_horaires_chk_1` CHECK ((`jour_semaine` between 0 and 6))
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `business_horaires`
--

LOCK TABLES `business_horaires` WRITE;
/*!40000 ALTER TABLE `business_horaires` DISABLE KEYS */;
INSERT INTO `business_horaires` VALUES (1,1,1,'09:00:00','18:00:00','12:00:00','13:00:00',1),(2,1,2,'09:00:00','18:00:00','12:00:00','13:00:00',1),(3,1,3,'09:00:00','18:00:00','12:00:00','13:00:00',1),(4,1,4,'09:00:00','18:00:00','12:00:00','13:00:00',1),(5,1,5,'09:00:00','18:00:00','12:00:00','13:00:00',1),(6,2,1,'09:00:00','20:00:00',NULL,NULL,1),(7,2,2,'09:00:00','20:00:00',NULL,NULL,1),(8,2,3,'09:00:00','20:00:00',NULL,NULL,1),(9,2,4,'09:00:00','20:00:00',NULL,NULL,1),(10,2,5,'09:00:00','20:00:00',NULL,NULL,1),(11,3,1,'09:00:00','19:00:00',NULL,NULL,1),(12,3,2,'09:00:00','19:00:00',NULL,NULL,1),(13,3,3,'09:00:00','19:00:00',NULL,NULL,1),(14,3,4,'09:00:00','19:00:00',NULL,NULL,1),(15,3,5,'09:00:00','19:00:00',NULL,NULL,1),(16,4,2,'09:00:00','19:00:00','12:00:00','14:00:00',1),(17,4,3,'09:00:00','19:00:00','12:00:00','14:00:00',1),(18,4,4,'09:00:00','19:00:00','12:00:00','14:00:00',1),(19,4,5,'09:00:00','19:00:00','12:00:00','14:00:00',1),(20,5,2,'10:00:00','19:00:00','12:00:00','14:00:00',1),(21,5,3,'10:00:00','19:00:00','12:00:00','14:00:00',1),(22,5,4,'10:00:00','19:00:00','12:00:00','14:00:00',1),(23,5,5,'10:00:00','19:00:00','12:00:00','14:00:00',1),(24,6,2,'09:00:00','18:00:00','12:00:00','14:00:00',1),(25,6,3,'09:00:00','18:00:00','12:00:00','14:00:00',1),(26,6,4,'09:00:00','18:00:00','12:00:00','14:00:00',1),(27,6,5,'09:00:00','19:00:00','12:00:00','14:00:00',1);
/*!40000 ALTER TABLE `business_horaires` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `business_user`
--

DROP TABLE IF EXISTS `business_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `business_user` (
  `id_business_user` int NOT NULL AUTO_INCREMENT,
  `id_user` int NOT NULL,
  `id_business` int NOT NULL,
  `role_interne` enum('proprietaire','employe') DEFAULT 'employe',
  `date_embauche` date DEFAULT NULL,
  `date_depart` date DEFAULT NULL,
  `specialites` json DEFAULT NULL,
  `actif` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id_business_user`),
  UNIQUE KEY `id_business` (`id_business`,`id_user`),
  KEY `id_user` (`id_user`),
  CONSTRAINT `business_user_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `user` (`id_user`) ON DELETE CASCADE,
  CONSTRAINT `business_user_ibfk_2` FOREIGN KEY (`id_business`) REFERENCES `business` (`id_business`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `business_user`
--

LOCK TABLES `business_user` WRITE;
/*!40000 ALTER TABLE `business_user` DISABLE KEYS */;
INSERT INTO `business_user` VALUES (1,1,1,'proprietaire',NULL,NULL,NULL,1),(2,3,1,'employe','2023-01-15',NULL,NULL,1),(3,4,1,'employe','2022-08-01',NULL,NULL,1),(4,5,1,'employe','2024-03-20',NULL,NULL,1),(5,200,2,'',NULL,NULL,NULL,1),(6,201,3,'',NULL,NULL,NULL,1),(7,202,4,'',NULL,NULL,NULL,1),(8,203,5,'',NULL,NULL,NULL,1),(9,204,6,'',NULL,NULL,NULL,1),(10,210,2,'',NULL,NULL,NULL,1),(11,211,2,'',NULL,NULL,NULL,1),(12,212,2,'',NULL,NULL,NULL,1),(13,213,2,'',NULL,NULL,NULL,1),(14,214,2,'',NULL,NULL,NULL,1),(15,215,3,'',NULL,NULL,NULL,1),(16,216,3,'',NULL,NULL,NULL,1),(17,217,3,'',NULL,NULL,NULL,1),(18,218,3,'',NULL,NULL,NULL,1),(19,219,3,'',NULL,NULL,NULL,1),(20,220,4,'',NULL,NULL,NULL,1),(21,221,4,'',NULL,NULL,NULL,1),(22,222,4,'',NULL,NULL,NULL,1),(23,223,4,'',NULL,NULL,NULL,1),(24,224,4,'',NULL,NULL,NULL,1),(25,225,5,'',NULL,NULL,NULL,1),(26,226,5,'',NULL,NULL,NULL,1),(27,227,5,'',NULL,NULL,NULL,1),(28,228,5,'',NULL,NULL,NULL,1),(29,229,5,'',NULL,NULL,NULL,1),(30,230,6,'',NULL,NULL,NULL,1),(31,231,6,'',NULL,NULL,NULL,1),(32,232,6,'',NULL,NULL,NULL,1),(33,233,6,'',NULL,NULL,NULL,1),(34,234,6,'',NULL,NULL,NULL,1);
/*!40000 ALTER TABLE `business_user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `client_business_note`
--

DROP TABLE IF EXISTS `client_business_note`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `client_business_note` (
  `id_note` int NOT NULL AUTO_INCREMENT,
  `id_user_client` int NOT NULL,
  `id_business` int NOT NULL,
  `id_business_user_auteur` int NOT NULL,
  `contenu_note` text NOT NULL,
  `date_creation` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `actif` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id_note`),
  KEY `id_user_client` (`id_user_client`),
  KEY `id_business` (`id_business`),
  KEY `id_business_user_auteur` (`id_business_user_auteur`),
  CONSTRAINT `client_business_note_ibfk_1` FOREIGN KEY (`id_user_client`) REFERENCES `user` (`id_user`) ON DELETE CASCADE,
  CONSTRAINT `client_business_note_ibfk_2` FOREIGN KEY (`id_business`) REFERENCES `business` (`id_business`) ON DELETE CASCADE,
  CONSTRAINT `client_business_note_ibfk_3` FOREIGN KEY (`id_business_user_auteur`) REFERENCES `business_user` (`id_business_user`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `client_business_note`
--

LOCK TABLES `client_business_note` WRITE;
/*!40000 ALTER TABLE `client_business_note` DISABLE KEYS */;
/*!40000 ALTER TABLE `client_business_note` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `client_employee_preference`
--

DROP TABLE IF EXISTS `client_employee_preference`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `client_employee_preference` (
  `id_preference` int NOT NULL AUTO_INCREMENT,
  `id_user_client` int NOT NULL,
  `id_business_user` int NOT NULL,
  `date_creation` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_preference`),
  UNIQUE KEY `id_user_client` (`id_user_client`,`id_business_user`),
  KEY `id_business_user` (`id_business_user`),
  CONSTRAINT `client_employee_preference_ibfk_1` FOREIGN KEY (`id_user_client`) REFERENCES `user` (`id_user`) ON DELETE CASCADE,
  CONSTRAINT `client_employee_preference_ibfk_2` FOREIGN KEY (`id_business_user`) REFERENCES `business_user` (`id_business_user`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `client_employee_preference`
--

LOCK TABLES `client_employee_preference` WRITE;
/*!40000 ALTER TABLE `client_employee_preference` DISABLE KEYS */;
/*!40000 ALTER TABLE `client_employee_preference` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `commande`
--

DROP TABLE IF EXISTS `commande`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `commande` (
  `id_commande` int NOT NULL AUTO_INCREMENT,
  `id_user_client` int NOT NULL,
  `id_business` int NOT NULL,
  `date_commande` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `total_ttc` decimal(10,2) DEFAULT NULL,
  `statut` enum('en_attente','confirmee','preparee','livree','annulee') DEFAULT NULL,
  `mode_retrait` enum('salon','livraison') DEFAULT NULL,
  PRIMARY KEY (`id_commande`),
  KEY `id_user_client` (`id_user_client`),
  KEY `id_business` (`id_business`),
  CONSTRAINT `commande_ibfk_1` FOREIGN KEY (`id_user_client`) REFERENCES `user` (`id_user`) ON DELETE RESTRICT,
  CONSTRAINT `commande_ibfk_2` FOREIGN KEY (`id_business`) REFERENCES `business` (`id_business`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `commande`
--

LOCK TABLES `commande` WRITE;
/*!40000 ALTER TABLE `commande` DISABLE KEYS */;
/*!40000 ALTER TABLE `commande` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `commande_detail`
--

DROP TABLE IF EXISTS `commande_detail`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `commande_detail` (
  `id_commande_detail` int NOT NULL AUTO_INCREMENT,
  `id_commande` int NOT NULL,
  `id_produit` int NOT NULL,
  `quantite` int NOT NULL,
  `prix_unitaire` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id_commande_detail`),
  KEY `id_commande` (`id_commande`),
  KEY `id_produit` (`id_produit`),
  CONSTRAINT `commande_detail_ibfk_1` FOREIGN KEY (`id_commande`) REFERENCES `commande` (`id_commande`) ON DELETE CASCADE,
  CONSTRAINT `commande_detail_ibfk_2` FOREIGN KEY (`id_produit`) REFERENCES `produit` (`id_produit`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `commande_detail`
--

LOCK TABLES `commande_detail` WRITE;
/*!40000 ALTER TABLE `commande_detail` DISABLE KEYS */;
/*!40000 ALTER TABLE `commande_detail` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `consentements_cookies`
--

DROP TABLE IF EXISTS `consentements_cookies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `consentements_cookies` (
  `id_consentement` int NOT NULL AUTO_INCREMENT,
  `id_user` int DEFAULT NULL,
  `preferences` tinyint(1) DEFAULT '0',
  `analytics` tinyint(1) DEFAULT '0',
  `marketing` tinyint(1) DEFAULT '0',
  `date_acceptation` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `ip_adresse` varchar(45) DEFAULT NULL,
  `user_agent` text,
  PRIMARY KEY (`id_consentement`),
  KEY `id_user` (`id_user`),
  CONSTRAINT `consentements_cookies_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `user` (`id_user`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `consentements_cookies`
--

LOCK TABLES `consentements_cookies` WRITE;
/*!40000 ALTER TABLE `consentements_cookies` DISABLE KEYS */;
/*!40000 ALTER TABLE `consentements_cookies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employee_absences`
--

DROP TABLE IF EXISTS `employee_absences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_absences` (
  `id_absence` int NOT NULL AUTO_INCREMENT,
  `id_business_user` int NOT NULL,
  `date_debut` datetime NOT NULL,
  `date_fin` datetime NOT NULL,
  `heure_debut` time DEFAULT NULL,
  `heure_fin` time DEFAULT NULL,
  `motif` varchar(100) DEFAULT NULL,
  `type_absence` enum('conge','maladie','formation','autre') NOT NULL,
  `validee` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id_absence`),
  KEY `id_business_user` (`id_business_user`),
  CONSTRAINT `employee_absences_ibfk_1` FOREIGN KEY (`id_business_user`) REFERENCES `business_user` (`id_business_user`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee_absences`
--

LOCK TABLES `employee_absences` WRITE;
/*!40000 ALTER TABLE `employee_absences` DISABLE KEYS */;
INSERT INTO `employee_absences` VALUES (1,2,'2025-12-17 00:00:00','2025-12-17 00:00:00','14:00:00','16:00:00','Formation produit','conge',0);
/*!40000 ALTER TABLE `employee_absences` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employee_disponibilites`
--

DROP TABLE IF EXISTS `employee_disponibilites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_disponibilites` (
  `id_disponibilite` int NOT NULL AUTO_INCREMENT,
  `id_business_user` int NOT NULL,
  `jour_semaine` tinyint NOT NULL,
  `heure_debut` time NOT NULL,
  `heure_fin` time NOT NULL,
  `pause_debut` time DEFAULT NULL,
  `pause_fin` time DEFAULT NULL,
  PRIMARY KEY (`id_disponibilite`),
  KEY `id_business_user` (`id_business_user`),
  CONSTRAINT `employee_disponibilites_ibfk_1` FOREIGN KEY (`id_business_user`) REFERENCES `business_user` (`id_business_user`) ON DELETE CASCADE,
  CONSTRAINT `employee_disponibilites_chk_1` CHECK ((`jour_semaine` between 0 and 6))
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee_disponibilites`
--

LOCK TABLES `employee_disponibilites` WRITE;
/*!40000 ALTER TABLE `employee_disponibilites` DISABLE KEYS */;
INSERT INTO `employee_disponibilites` VALUES (1,2,1,'09:00:00','17:00:00','12:00:00','13:00:00'),(2,3,2,'10:00:00','19:00:00','12:00:00','13:00:00'),(3,4,3,'11:00:00','18:00:00','12:00:00','13:00:00'),(4,2,1,'09:00:00','18:00:00','12:00:00','13:00:00'),(5,2,2,'09:00:00','18:00:00','12:00:00','13:00:00'),(6,2,4,'09:00:00','18:00:00','12:00:00','13:00:00'),(7,3,2,'09:00:00','18:00:00','12:00:00','13:00:00'),(8,3,3,'09:00:00','18:00:00','12:00:00','13:00:00'),(9,3,5,'09:00:00','18:00:00','12:00:00','13:00:00'),(10,4,3,'09:00:00','18:00:00','12:00:00','13:00:00'),(11,4,4,'09:00:00','18:00:00','12:00:00','13:00:00'),(12,4,5,'09:00:00','18:00:00','12:00:00','13:00:00'),(13,10,1,'09:00:00','17:00:00',NULL,NULL),(14,11,1,'12:00:00','20:00:00',NULL,NULL),(15,20,2,'09:00:00','19:00:00',NULL,NULL);
/*!40000 ALTER TABLE `employee_disponibilites` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notification`
--

DROP TABLE IF EXISTS `notification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notification` (
  `id_notification` int NOT NULL AUTO_INCREMENT,
  `id_user` int NOT NULL,
  `id_reservation` int DEFAULT NULL,
  `type_notification` enum('confirmation_rdv','rappel_rdv','annulation','modification','promo') NOT NULL,
  `canal` enum('email','sms','push') NOT NULL,
  `destinataire` varchar(255) NOT NULL,
  `contenu` text NOT NULL,
  `statut_envoi` enum('en_attente','envoye','echec') NOT NULL,
  `date_envoi` datetime DEFAULT NULL,
  `date_creation` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_notification`),
  KEY `id_user` (`id_user`),
  KEY `id_reservation` (`id_reservation`),
  CONSTRAINT `notification_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `user` (`id_user`) ON DELETE CASCADE,
  CONSTRAINT `notification_ibfk_2` FOREIGN KEY (`id_reservation`) REFERENCES `reservation` (`id_reservation`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification`
--

LOCK TABLES `notification` WRITE;
/*!40000 ALTER TABLE `notification` DISABLE KEYS */;
/*!40000 ALTER TABLE `notification` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prestation`
--

DROP TABLE IF EXISTS `prestation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prestation` (
  `id_prestation` int NOT NULL AUTO_INCREMENT,
  `id_business` int NOT NULL,
  `nom` varchar(255) NOT NULL,
  `description` text,
  `tarif_forfait` decimal(10,2) DEFAULT NULL,
  `type_prestation` varchar(50) DEFAULT NULL,
  `actif` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id_prestation`),
  KEY `id_business` (`id_business`),
  CONSTRAINT `prestation_ibfk_1` FOREIGN KEY (`id_business`) REFERENCES `business` (`id_business`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prestation`
--

LOCK TABLES `prestation` WRITE;
/*!40000 ALTER TABLE `prestation` DISABLE KEYS */;
INSERT INTO `prestation` VALUES (1,1,'Shampoing + Brushing','Mise en beauté express avec diagnostic capillaire ciblé et produits véganes [cite: 20, 21].',35.00,'Coiffage',1),(2,1,'Shampoing + Coupe + Brushing','Notre prestation phare : diagnostic, coupe personnalisée et brushing sur-mesure [cite: 27, 30, 31].',56.00,'Coupe Femme',1),(3,1,'Coupe frange','Retouche d\'entretien ou création d\'une frange tendance sur cheveux propres [cite: 36, 37].',11.00,'Coupe Simple',1),(4,1,'Attache / Chignon','Coiffure artistique pour événement spécial (mariage, gala) [cite: 41].',32.00,'Attache',1),(5,1,'Coloration + Brushing (Racines)','Bilan approfondi, application racines sans ammoniaque, suivi shampoing et brushing [cite: 49, 51].',77.00,'Couleur',1),(6,1,'Coloration + Coupe + Brushing (Racines)','Coloration racines + Coupe + Brushing. Sur devis pour la décoloration [cite: 7].',NULL,'Couleur',1),(7,1,'Mèches + Brushing','Balayage, Ombré ou Contouring avec double soin post-déco inclus [cite: 53, 58].',99.00,'Mèches',1),(8,1,'Lissage Glatt + Brushing','Défrisage durable pour cheveux frisés ou rebelles, avec protection du cuir chevelu [cite: 66, 67].',77.00,'Lissage',1),(9,1,'Masque Réparateur Express','Traitement intensif en Kératine et protéines [cite: 74].',8.00,'Soin Complémentaire',1),(10,1,'Soin Botox Capillaire','Traitement profond sans aiguille à l\'Acide Hyaluronique, réduit les frisottis [cite: 81, 82].',50.00,'Soin Profond',1),(11,1,'Soin Profond Kératine Premium (Cure)','Cure de fortification maximale, pénétration sous vapeur d\'ozone [cite: 86, 88].',275.00,'Soin Premium',1),(12,1,'Rituel SPA Relaxation (Massage)','Expérience sensorielle et détente profonde [cite: 96, 99].',46.00,'Soin SPA',1),(13,1,'Coupe Enfant - 7 ans','Approche ludique et bienveillante, avec certificat Première Coupe [cite: 103, 105].',20.00,'Coupe Enfant',1),(14,1,'Coupe Homme (Classique)','Service Coiffure Homme : shampoing, coupe nette et coiffage produits haut de gamme [cite: 112, 114].',32.00,'Coupe Homme',1),(15,1,'Consultation Conseil','Bilan d\'analyse capillaire approfondie et conseils objectifs, sans engagement[cite: 116, 118].',15.00,'Conseil',1);
/*!40000 ALTER TABLE `prestation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prestation_service`
--

DROP TABLE IF EXISTS `prestation_service`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prestation_service` (
  `id_prestation` int NOT NULL,
  `id_service_unitaire` int NOT NULL,
  PRIMARY KEY (`id_prestation`,`id_service_unitaire`),
  KEY `id_service_unitaire` (`id_service_unitaire`),
  CONSTRAINT `prestation_service_ibfk_1` FOREIGN KEY (`id_prestation`) REFERENCES `prestation` (`id_prestation`) ON DELETE CASCADE,
  CONSTRAINT `prestation_service_ibfk_2` FOREIGN KEY (`id_service_unitaire`) REFERENCES `service_unitaire` (`id_service_unitaire`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prestation_service`
--

LOCK TABLES `prestation_service` WRITE;
/*!40000 ALTER TABLE `prestation_service` DISABLE KEYS */;
INSERT INTO `prestation_service` VALUES (2,1),(5,1),(2,2),(5,2),(2,3),(5,6),(14,18),(13,19);
/*!40000 ALTER TABLE `prestation_service` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `produit`
--

DROP TABLE IF EXISTS `produit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `produit` (
  `id_produit` int NOT NULL AUTO_INCREMENT,
  `id_business` int NOT NULL,
  `nom` varchar(255) NOT NULL,
  `description` text,
  `prix` decimal(10,2) NOT NULL,
  `stock` int DEFAULT '0',
  `categorie_produit` varchar(100) DEFAULT NULL,
  `actif` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id_produit`),
  KEY `id_business` (`id_business`),
  CONSTRAINT `produit_ibfk_1` FOREIGN KEY (`id_business`) REFERENCES `business` (`id_business`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `produit`
--

LOCK TABLES `produit` WRITE;
/*!40000 ALTER TABLE `produit` DISABLE KEYS */;
/*!40000 ALTER TABLE `produit` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reservation`
--

DROP TABLE IF EXISTS `reservation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reservation` (
  `id_reservation` int NOT NULL AUTO_INCREMENT,
  `id_user_client` int NOT NULL,
  `id_business` int NOT NULL,
  `id_business_user` int DEFAULT NULL,
  `id_prestation` int NOT NULL,
  `date_reservation` datetime NOT NULL,
  `heure_fin_calculee` datetime NOT NULL,
  `statut` enum('pending','confirmed','cancelled','no_show','completed') DEFAULT 'pending',
  `commentaire_client` text,
  `commentaire_interne` text,
  `notification_email_sent` tinyint(1) DEFAULT '0',
  `date_creation` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `date_modification` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_reservation`),
  KEY `id_user_client` (`id_user_client`),
  KEY `id_business` (`id_business`),
  KEY `id_business_user` (`id_business_user`),
  KEY `id_prestation` (`id_prestation`),
  CONSTRAINT `reservation_ibfk_1` FOREIGN KEY (`id_user_client`) REFERENCES `user` (`id_user`) ON DELETE RESTRICT,
  CONSTRAINT `reservation_ibfk_2` FOREIGN KEY (`id_business`) REFERENCES `business` (`id_business`) ON DELETE RESTRICT,
  CONSTRAINT `reservation_ibfk_3` FOREIGN KEY (`id_business_user`) REFERENCES `business_user` (`id_business_user`) ON DELETE SET NULL,
  CONSTRAINT `reservation_ibfk_4` FOREIGN KEY (`id_prestation`) REFERENCES `prestation` (`id_prestation`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=86 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reservation`
--

LOCK TABLES `reservation` WRITE;
/*!40000 ALTER TABLE `reservation` DISABLE KEYS */;
INSERT INTO `reservation` VALUES (2,300,2,10,14,'2025-11-28 11:34:51','2025-11-28 12:04:51','completed',NULL,NULL,1,'2025-12-08 10:34:51',NULL),(3,300,2,11,2,'2025-10-08 11:34:51','2025-10-08 12:19:51','completed',NULL,NULL,1,'2025-12-08 10:34:51',NULL),(14,301,2,10,1,'2025-12-09 09:00:00','2025-12-09 09:30:00','confirmed',NULL,NULL,0,'2025-12-08 10:45:36',NULL),(15,302,2,10,2,'2025-12-09 10:00:00','2025-12-09 11:00:00','confirmed',NULL,NULL,0,'2025-12-08 10:45:36',NULL),(16,303,2,11,1,'2025-12-09 18:00:00','2025-12-09 18:30:00','confirmed',NULL,NULL,0,'2025-12-08 10:45:36',NULL),(17,304,2,11,3,'2025-12-09 18:30:00','2025-12-09 20:30:00','confirmed',NULL,NULL,0,'2025-12-08 10:45:36',NULL),(18,305,2,10,1,'2025-12-10 13:00:00','2025-12-10 13:30:00','confirmed',NULL,NULL,0,'2025-12-08 10:45:36',NULL),(19,306,2,11,2,'2025-12-10 13:15:00','2025-12-10 14:15:00','pending',NULL,NULL,0,'2025-12-08 10:45:36',NULL),(20,307,2,10,3,'2025-12-11 14:00:00','2025-12-11 16:00:00','confirmed',NULL,NULL,0,'2025-12-08 10:45:36',NULL),(21,308,2,11,1,'2025-12-11 19:00:00','2025-12-11 19:30:00','confirmed',NULL,NULL,0,'2025-12-08 10:45:36',NULL),(22,309,2,10,2,'2025-12-12 09:30:00','2025-12-12 10:30:00','confirmed',NULL,NULL,0,'2025-12-08 10:45:36',NULL),(23,310,2,11,2,'2025-12-12 17:00:00','2025-12-12 18:00:00','cancelled',NULL,NULL,0,'2025-12-08 10:45:36',NULL),(24,311,3,15,1,'2025-12-09 09:00:00','2025-12-09 09:30:00','confirmed',NULL,NULL,0,'2025-12-08 10:45:49',NULL),(25,312,3,16,2,'2025-12-09 10:00:00','2025-12-09 11:00:00','confirmed',NULL,NULL,0,'2025-12-08 10:45:49',NULL),(26,313,3,15,3,'2025-12-09 14:00:00','2025-12-09 16:00:00','confirmed',NULL,NULL,0,'2025-12-08 10:45:49',NULL),(27,314,3,16,1,'2025-12-10 11:00:00','2025-12-10 11:30:00','confirmed',NULL,NULL,0,'2025-12-08 10:45:49',NULL),(28,315,3,15,2,'2025-12-10 16:00:00','2025-12-10 17:00:00','pending',NULL,NULL,0,'2025-12-08 10:45:49',NULL),(29,316,3,16,1,'2025-12-11 09:30:00','2025-12-11 10:00:00','confirmed',NULL,NULL,0,'2025-12-08 10:45:49',NULL),(30,317,3,15,2,'2025-12-11 15:00:00','2025-12-11 16:00:00','confirmed',NULL,NULL,0,'2025-12-08 10:45:49',NULL),(31,318,3,16,1,'2025-12-12 17:30:00','2025-12-12 18:00:00','confirmed',NULL,NULL,0,'2025-12-08 10:45:49',NULL),(32,319,3,15,3,'2025-12-12 14:00:00','2025-12-12 16:00:00','confirmed',NULL,NULL,0,'2025-12-08 10:45:49',NULL),(33,320,3,16,1,'2025-12-13 10:00:00','2025-12-13 10:30:00','confirmed',NULL,NULL,0,'2025-12-08 10:45:49',NULL),(64,321,4,20,2,'2025-12-09 10:00:00','2025-12-09 11:00:00','confirmed',NULL,NULL,0,'2025-12-08 10:49:04',NULL),(65,322,4,21,1,'2025-12-09 11:30:00','2025-12-09 12:00:00','confirmed',NULL,NULL,0,'2025-12-08 10:49:04',NULL),(66,323,4,20,3,'2025-12-09 14:00:00','2025-12-09 16:00:00','confirmed',NULL,NULL,0,'2025-12-08 10:49:04',NULL),(67,324,4,21,1,'2025-12-10 09:00:00','2025-12-10 09:30:00','confirmed',NULL,NULL,0,'2025-12-08 10:49:04',NULL),(68,325,4,20,2,'2025-12-10 16:00:00','2025-12-10 17:00:00','confirmed',NULL,NULL,0,'2025-12-08 10:49:04',NULL),(69,326,4,21,1,'2025-12-11 18:00:00','2025-12-11 18:30:00','confirmed',NULL,NULL,0,'2025-12-08 10:49:04',NULL),(70,327,4,20,1,'2025-12-11 11:00:00','2025-12-11 11:30:00','pending',NULL,NULL,0,'2025-12-08 10:49:04',NULL),(71,328,4,21,3,'2025-12-12 14:30:00','2025-12-12 16:30:00','confirmed',NULL,NULL,0,'2025-12-08 10:49:04',NULL),(72,329,4,20,1,'2025-12-12 09:30:00','2025-12-12 10:00:00','confirmed',NULL,NULL,0,'2025-12-08 10:49:04',NULL),(73,330,4,21,2,'2025-12-13 17:00:00','2025-12-13 18:00:00','confirmed',NULL,NULL,0,'2025-12-08 10:49:04',NULL),(74,331,5,25,3,'2025-12-09 09:00:00','2025-12-09 11:00:00','confirmed',NULL,NULL,0,'2025-12-08 10:49:21',NULL),(75,332,5,26,1,'2025-12-09 14:00:00','2025-12-09 14:30:00','confirmed',NULL,NULL,0,'2025-12-08 10:49:21',NULL),(76,333,5,25,2,'2025-12-10 10:00:00','2025-12-10 11:00:00','confirmed',NULL,NULL,0,'2025-12-08 10:49:21',NULL),(77,334,5,26,1,'2025-12-10 16:00:00','2025-12-10 16:30:00','confirmed',NULL,NULL,0,'2025-12-08 10:49:21',NULL),(78,335,5,25,1,'2025-12-11 11:30:00','2025-12-11 12:00:00','confirmed',NULL,NULL,0,'2025-12-08 10:49:21',NULL),(79,336,6,30,2,'2025-12-09 14:00:00','2025-12-09 15:00:00','confirmed',NULL,NULL,0,'2025-12-08 10:49:21',NULL),(80,337,6,31,3,'2025-12-09 09:00:00','2025-12-09 11:00:00','confirmed',NULL,NULL,0,'2025-12-08 10:49:21',NULL),(81,338,6,30,1,'2025-12-10 17:00:00','2025-12-10 17:30:00','confirmed',NULL,NULL,0,'2025-12-08 10:49:21',NULL),(82,339,6,31,1,'2025-12-10 11:00:00','2025-12-10 11:30:00','pending',NULL,NULL,0,'2025-12-08 10:49:21',NULL),(83,340,6,30,2,'2025-12-11 15:00:00','2025-12-11 16:00:00','confirmed',NULL,NULL,0,'2025-12-08 10:49:21',NULL),(84,1,1,2,1,'2026-06-15 14:00:00','2026-06-15 14:30:00','pending',NULL,NULL,0,'2025-12-09 12:52:44',NULL),(85,1,1,2,1,'2026-06-15 14:00:00','2026-06-15 14:30:00','pending',NULL,NULL,0,'2025-12-09 12:55:16',NULL);
/*!40000 ALTER TABLE `reservation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reservation_historique`
--

DROP TABLE IF EXISTS `reservation_historique`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reservation_historique` (
  `id_historique` int NOT NULL AUTO_INCREMENT,
  `id_reservation` int NOT NULL,
  `statut_avant` varchar(50) DEFAULT NULL,
  `statut_apres` varchar(50) DEFAULT NULL,
  `id_user_action` int DEFAULT NULL,
  `commentaire` text,
  `date_action` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_historique`),
  KEY `id_reservation` (`id_reservation`),
  KEY `id_user_action` (`id_user_action`),
  CONSTRAINT `reservation_historique_ibfk_1` FOREIGN KEY (`id_reservation`) REFERENCES `reservation` (`id_reservation`) ON DELETE CASCADE,
  CONSTRAINT `reservation_historique_ibfk_2` FOREIGN KEY (`id_user_action`) REFERENCES `user` (`id_user`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reservation_historique`
--

LOCK TABLES `reservation_historique` WRITE;
/*!40000 ALTER TABLE `reservation_historique` DISABLE KEYS */;
/*!40000 ALTER TABLE `reservation_historique` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reservation_paiement`
--

DROP TABLE IF EXISTS `reservation_paiement`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reservation_paiement` (
  `id_paiement` int NOT NULL AUTO_INCREMENT,
  `id_reservation` int NOT NULL,
  `mode_paiement` enum('carte','especes','cheque','stripe','paypal') DEFAULT NULL,
  `montant` decimal(10,2) NOT NULL,
  `statut_paiement` enum('pending','paid','refunded','failed') DEFAULT 'pending',
  `date_paiement` datetime DEFAULT NULL,
  `transaction_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_paiement`),
  KEY `id_reservation` (`id_reservation`),
  CONSTRAINT `reservation_paiement_ibfk_1` FOREIGN KEY (`id_reservation`) REFERENCES `reservation` (`id_reservation`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reservation_paiement`
--

LOCK TABLES `reservation_paiement` WRITE;
/*!40000 ALTER TABLE `reservation_paiement` DISABLE KEYS */;
INSERT INTO `reservation_paiement` VALUES (1,2,'carte',32.00,'paid','2025-11-28 11:34:51',NULL),(2,3,'especes',50.00,'paid','2025-10-08 11:34:51',NULL);
/*!40000 ALTER TABLE `reservation_paiement` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role`
--

DROP TABLE IF EXISTS `role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role` (
  `id_role` int NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL,
  `libelle` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id_role`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role`
--

LOCK TABLES `role` WRITE;
/*!40000 ALTER TABLE `role` DISABLE KEYS */;
INSERT INTO `role` VALUES (1,'SUPERADMIN','Administrateur Principal (Patron Multi-Salons)'),(2,'ADMIN','Administrateur de Salon (Directeur)'),(3,'EMPLOYE','Employé / Coiffeur'),(4,'CLIENT','Client Utilisateur');
/*!40000 ALTER TABLE `role` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `service_unitaire`
--

DROP TABLE IF EXISTS `service_unitaire`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `service_unitaire` (
  `id_service_unitaire` int NOT NULL AUTO_INCREMENT,
  `id_business` int NOT NULL,
  `nom` varchar(255) NOT NULL,
  `description` text,
  `duree_minutes` int NOT NULL,
  `duree_blocage` int DEFAULT NULL COMMENT 'Temps effectif de travail employé (si différent de la durée totale)',
  `tarif_min` decimal(10,2) NOT NULL,
  `tarif_max` decimal(10,2) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `actif` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id_service_unitaire`),
  KEY `id_business` (`id_business`),
  CONSTRAINT `service_unitaire_ibfk_1` FOREIGN KEY (`id_business`) REFERENCES `business` (`id_business`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service_unitaire`
--

LOCK TABLES `service_unitaire` WRITE;
/*!40000 ALTER TABLE `service_unitaire` DISABLE KEYS */;
INSERT INTO `service_unitaire` VALUES (1,1,'Shampoing','Lavage standard.',10,0,5.00,5.00,NULL,1),(2,1,'Brushing','Mise en forme (court/moyen).',25,30,15.00,30.00,NULL,1),(3,1,'Coupe Base (Femme)','Coupe simple, base d’un forfait.',35,30,25.00,50.00,NULL,1),(4,1,'Coupe Frange','Retouche ou création de frange.',10,10,11.00,11.00,NULL,1),(5,1,'Attache / Chignon Base','Préparation pour événement.',30,30,32.00,50.00,NULL,1),(6,1,'Coloration - Application Racines','Application de couleur uniquement sur les racines.',45,30,40.00,70.00,NULL,1),(7,1,'Mèches / Balayage Base','Application de la technique d\'éclaircissement.',90,45,70.00,150.00,NULL,1),(8,1,'Ondulation / Mise en Forme','Technique pour donner du mouvement et de la texture.',60,30,40.00,80.00,NULL,1),(9,1,'Lissage Glatt (Traitement)','Application du produit lissant.',45,30,45.00,90.00,NULL,1),(10,1,'Masque Réparateur','Traitement intensif ciblée.',5,5,8.00,8.00,NULL,1),(11,1,'Soin Repigmentant','Raviver l\'éclat d\'une couleur.',15,15,14.00,14.00,NULL,1),(12,1,'Soin Botox','Traitement profond Kératine et Acide Hyaluronique.',60,30,50.00,104.00,NULL,1),(13,1,'Soin Profond Kératine Premium','Cure de fortification maximale.',150,30,275.00,475.00,NULL,1),(14,1,'Soin Exfoliant / Apaisant','Gommage du cuir chevelu.',10,10,20.00,20.00,NULL,1),(15,1,'Rituel SPA Équilibre','Massage crânien + masque.',20,20,26.00,26.00,NULL,1),(16,1,'Rituel SPA Relaxation','Détente profonde par massage crânien précis.',35,30,46.00,46.00,NULL,1),(17,1,'Rituel SPA Sérénité','Rituel complet (bain d\'huile, fontaine d\'eau).',50,30,66.00,66.00,NULL,1),(18,1,'Technique Coupe Homme','Coupe tondeuse/ciseaux',30,30,25.00,32.00,NULL,1),(19,1,'Technique Coupe Enfant','Coupe rapide enfant',20,20,15.00,20.00,NULL,1);
/*!40000 ALTER TABLE `service_unitaire` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id_user` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `prenom` varchar(100) DEFAULT NULL,
  `nom` varchar(100) DEFAULT NULL,
  `telephone` varchar(20) DEFAULT NULL,
  `role_global` enum('CLIENT','EMPLOYE','ADMIN','SUPER_ADMIN') NOT NULL DEFAULT 'CLIENT',
  `adresse` varchar(255) DEFAULT NULL,
  `ville` varchar(100) DEFAULT NULL,
  `code_postal` varchar(10) DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `date_creation` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `statut_compte` enum('active','suspended','deleted') DEFAULT 'active',
  PRIMARY KEY (`id_user`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=341 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'superadmin@hairappointment.com','$2b$10$eGNNx2vUbGPrTE4mknhE/.TY/B62rnTotlfEUhuk4VC/gA7GKR74e','Gilles','Debydeal',NULL,'ADMIN',NULL,NULL,NULL,NULL,NULL,'2025-12-05 15:23:22','active'),(2,'client.test@domaine.com','$2b$10$ELkPyR4VuL51Ei2Oryp5M.N0z6PAswOcIfRzPV1SmHcu08jQpEP0m','Marine','Dupont','0601020304','CLIENT',NULL,NULL,NULL,NULL,NULL,'2025-12-06 12:55:23','active'),(3,'amelie.expert@salon.com','$2b$10$BzLoOurC5BOxzoas6WBLFuvFCeSGRS2ZuEf8qNkKPwPumqIFIj0..','Amélie','Moreau','0601000001','EMPLOYE',NULL,NULL,NULL,NULL,NULL,'2025-12-06 16:02:52','active'),(4,'benoit.styliste@salon.com','$2b$10$BzLoOurC5BOxzoas6WBLFuvFCeSGRS2ZuEf8qNkKPwPumqIFIj0..','Benoît','Lefevre','0601000002','EMPLOYE',NULL,NULL,NULL,NULL,NULL,'2025-12-06 16:02:52','active'),(5,'chloe.coiffeuse@salon.com','$2b$10$BzLoOurC5BOxzoas6WBLFuvFCeSGRS2ZuEf8qNkKPwPumqIFIj0..','Chloé','Petit','0601000003','EMPLOYE',NULL,NULL,NULL,NULL,NULL,'2025-12-06 16:02:52','active'),(200,'manager.paris@test.com','$2b$10$fVtLgA6bIJGi.i05zw5PC.eAZg2hVM8GMjgSjEIQ0CjXQDVv8Kgyy','Paris','Directeur','0600000001','ADMIN',NULL,'Paris',NULL,NULL,NULL,'2025-12-08 10:18:43','active'),(201,'manager.lyon@test.com','$2b$10$fVtLgA6bIJGi.i05zw5PC.eAZg2hVM8GMjgSjEIQ0CjXQDVv8Kgyy','Lyon','Directeur','0600000002','ADMIN',NULL,'Lyon',NULL,NULL,NULL,'2025-12-08 10:18:43','active'),(202,'manager.marseille@test.com','$2b$10$fVtLgA6bIJGi.i05zw5PC.eAZg2hVM8GMjgSjEIQ0CjXQDVv8Kgyy','Marseille','Directeur','0600000003','ADMIN',NULL,'Marseille',NULL,NULL,NULL,'2025-12-08 10:18:43','active'),(203,'manager.bordeaux@test.com','$2b$10$fVtLgA6bIJGi.i05zw5PC.eAZg2hVM8GMjgSjEIQ0CjXQDVv8Kgyy','Bordeaux','Directeur','0600000004','ADMIN',NULL,'Bordeaux',NULL,NULL,NULL,'2025-12-08 10:18:43','active'),(204,'manager.lille@test.com','$2b$10$fVtLgA6bIJGi.i05zw5PC.eAZg2hVM8GMjgSjEIQ0CjXQDVv8Kgyy','Lille','Directeur','0600000005','ADMIN',NULL,'Lille',NULL,NULL,NULL,'2025-12-08 10:18:43','active'),(210,'pierre.paris@test.com','$2b$10$fVtLgA6bIJGi.i05zw5PC.eAZg2hVM8GMjgSjEIQ0CjXQDVv8Kgyy','Pierre','Expert','0610000001','',NULL,'Paris',NULL,NULL,NULL,'2025-12-08 10:18:43','active'),(211,'sophie.paris@test.com','$2b$10$fVtLgA6bIJGi.i05zw5PC.eAZg2hVM8GMjgSjEIQ0CjXQDVv8Kgyy','Sophie','Coif','0610000002','',NULL,'Paris',NULL,NULL,NULL,'2025-12-08 10:18:43','active'),(212,'marc.paris@test.com','$2b$10$fVtLgA6bIJGi.i05zw5PC.eAZg2hVM8GMjgSjEIQ0CjXQDVv8Kgyy','Marc','Style','0610000003','',NULL,'Paris',NULL,NULL,NULL,'2025-12-08 10:18:43','active'),(213,'julie.paris@test.com','$2b$10$fVtLgA6bIJGi.i05zw5PC.eAZg2hVM8GMjgSjEIQ0CjXQDVv8Kgyy','Julie','Coupe','0610000004','',NULL,'Paris',NULL,NULL,NULL,'2025-12-08 10:18:43','active'),(214,'lucas.paris@test.com','$2b$10$fVtLgA6bIJGi.i05zw5PC.eAZg2hVM8GMjgSjEIQ0CjXQDVv8Kgyy','Lucas','Brush','0610000005','',NULL,'Paris',NULL,NULL,NULL,'2025-12-08 10:18:43','active'),(215,'lyon1@test.com','$2b$10$fVtLgA6bIJGi.i05zw5PC.eAZg2hVM8GMjgSjEIQ0CjXQDVv8Kgyy','Emp1','Lyon','0600000000','',NULL,'Lyon',NULL,NULL,NULL,'2025-12-08 10:18:43','active'),(216,'lyon2@test.com','$2b$10$fVtLgA6bIJGi.i05zw5PC.eAZg2hVM8GMjgSjEIQ0CjXQDVv8Kgyy','Emp2','Lyon','0600000000','',NULL,'Lyon',NULL,NULL,NULL,'2025-12-08 10:18:43','active'),(217,'lyon3@test.com','$2b$10$fVtLgA6bIJGi.i05zw5PC.eAZg2hVM8GMjgSjEIQ0CjXQDVv8Kgyy','Emp3','Lyon','0600000000','',NULL,'Lyon',NULL,NULL,NULL,'2025-12-08 10:18:43','active'),(218,'lyon4@test.com','$2b$10$fVtLgA6bIJGi.i05zw5PC.eAZg2hVM8GMjgSjEIQ0CjXQDVv8Kgyy','Emp4','Lyon','0600000000','',NULL,'Lyon',NULL,NULL,NULL,'2025-12-08 10:18:43','active'),(219,'lyon5@test.com','$2b$10$fVtLgA6bIJGi.i05zw5PC.eAZg2hVM8GMjgSjEIQ0CjXQDVv8Kgyy','Emp5','Lyon','0600000000','',NULL,'Lyon',NULL,NULL,NULL,'2025-12-08 10:18:43','active'),(220,'mars1@test.com','$2b$10$fVtLgA6bIJGi.i05zw5PC.eAZg2hVM8GMjgSjEIQ0CjXQDVv8Kgyy','Emp1','Mars','0600000000','',NULL,'Marseille',NULL,NULL,NULL,'2025-12-08 10:18:43','active'),(221,'mars2@test.com','$2b$10$fVtLgA6bIJGi.i05zw5PC.eAZg2hVM8GMjgSjEIQ0CjXQDVv8Kgyy','Emp2','Mars','0600000000','',NULL,'Marseille',NULL,NULL,NULL,'2025-12-08 10:18:43','active'),(222,'mars3@test.com','$2b$10$fVtLgA6bIJGi.i05zw5PC.eAZg2hVM8GMjgSjEIQ0CjXQDVv8Kgyy','Emp3','Mars','0600000000','',NULL,'Marseille',NULL,NULL,NULL,'2025-12-08 10:18:43','active'),(223,'mars4@test.com','$2b$10$fVtLgA6bIJGi.i05zw5PC.eAZg2hVM8GMjgSjEIQ0CjXQDVv8Kgyy','Emp4','Mars','0600000000','',NULL,'Marseille',NULL,NULL,NULL,'2025-12-08 10:18:43','active'),(224,'mars5@test.com','$2b$10$fVtLgA6bIJGi.i05zw5PC.eAZg2hVM8GMjgSjEIQ0CjXQDVv8Kgyy','Emp5','Mars','0600000000','',NULL,'Marseille',NULL,NULL,NULL,'2025-12-08 10:18:43','active'),(225,'bord1@test.com','$2b$10$fVtLgA6bIJGi.i05zw5PC.eAZg2hVM8GMjgSjEIQ0CjXQDVv8Kgyy','Emp1','Bord','0600000000','',NULL,'Bordeaux',NULL,NULL,NULL,'2025-12-08 10:18:43','active'),(226,'bord2@test.com','$2b$10$fVtLgA6bIJGi.i05zw5PC.eAZg2hVM8GMjgSjEIQ0CjXQDVv8Kgyy','Emp2','Bord','0600000000','',NULL,'Bordeaux',NULL,NULL,NULL,'2025-12-08 10:18:43','active'),(227,'bord3@test.com','$2b$10$fVtLgA6bIJGi.i05zw5PC.eAZg2hVM8GMjgSjEIQ0CjXQDVv8Kgyy','Emp3','Bord','0600000000','',NULL,'Bordeaux',NULL,NULL,NULL,'2025-12-08 10:18:43','active'),(228,'bord4@test.com','$2b$10$fVtLgA6bIJGi.i05zw5PC.eAZg2hVM8GMjgSjEIQ0CjXQDVv8Kgyy','Emp4','Bord','0600000000','',NULL,'Bordeaux',NULL,NULL,NULL,'2025-12-08 10:18:43','active'),(229,'bord5@test.com','$2b$10$fVtLgA6bIJGi.i05zw5PC.eAZg2hVM8GMjgSjEIQ0CjXQDVv8Kgyy','Emp5','Bord','0600000000','',NULL,'Bordeaux',NULL,NULL,NULL,'2025-12-08 10:18:43','active'),(230,'lille1@test.com','$2b$10$fVtLgA6bIJGi.i05zw5PC.eAZg2hVM8GMjgSjEIQ0CjXQDVv8Kgyy','Emp1','Lille','0600000000','',NULL,'Lille',NULL,NULL,NULL,'2025-12-08 10:18:43','active'),(231,'lille2@test.com','$2b$10$fVtLgA6bIJGi.i05zw5PC.eAZg2hVM8GMjgSjEIQ0CjXQDVv8Kgyy','Emp2','Lille','0600000000','',NULL,'Lille',NULL,NULL,NULL,'2025-12-08 10:18:43','active'),(232,'lille3@test.com','$2b$10$fVtLgA6bIJGi.i05zw5PC.eAZg2hVM8GMjgSjEIQ0CjXQDVv8Kgyy','Emp3','Lille','0600000000','',NULL,'Lille',NULL,NULL,NULL,'2025-12-08 10:18:43','active'),(233,'lille4@test.com','$2b$10$fVtLgA6bIJGi.i05zw5PC.eAZg2hVM8GMjgSjEIQ0CjXQDVv8Kgyy','Emp4','Lille','0600000000','',NULL,'Lille',NULL,NULL,NULL,'2025-12-08 10:18:43','active'),(234,'lille5@test.com','$2b$10$fVtLgA6bIJGi.i05zw5PC.eAZg2hVM8GMjgSjEIQ0CjXQDVv8Kgyy','Emp5','Lille','0600000000','',NULL,'Lille',NULL,NULL,NULL,'2025-12-08 10:18:43','active'),(300,'cl.p1@test.com','$2b$10$fVtLgA6bIJGi.i05zw5PC.eAZg2hVM8GMjgSjEIQ0CjXQDVv8Kgyy','Paris1','Client',NULL,'CLIENT',NULL,'Paris','75001',48.85661400,2.35222190,'2025-12-08 10:19:42','active'),(301,'cl.p2@test.com','$2b$10$fVtLgA6bIJGi.i05zw5PC.eAZg2hVM8GMjgSjEIQ0CjXQDVv8Kgyy','Paris2','Client',NULL,'CLIENT',NULL,'Paris','75002',48.86666700,2.33333300,'2025-12-08 10:19:42','active'),(302,'cl.p3@test.com','$2b$10$fVtLgA6bIJGi.i05zw5PC.eAZg2hVM8GMjgSjEIQ0CjXQDVv8Kgyy','Paris3','Client',NULL,'CLIENT',NULL,'Paris','75003',48.86471600,2.34901400,'2025-12-08 10:19:42','active'),(303,'cl.p4@test.com','$2b$10$fVtLgA6bIJGi.i05zw5PC.eAZg2hVM8GMjgSjEIQ0CjXQDVv8Kgyy$2b$10$fVtLgA6bIJGi.i05zw5PC.eAZg2hVM8GMjgSjEIQ0CjXQDVv8Kgyy','Paris4','Client',NULL,'CLIENT',NULL,'Paris','75004',48.85434100,2.35712300,'2025-12-08 10:19:42','active'),(304,'cl.p5@test.com','$2b$10$fVtLgA6bIJGi.i05zw5PC.eAZg2hVM8GMjgSjEIQ0CjXQDVv8Kgyy','Paris5','Client',NULL,'CLIENT',NULL,'Paris','75005',48.84430400,2.34638700,'2025-12-08 10:19:42','active'),(305,'cl.l1@test.com','$2b$10$fVtLgA6bIJGi.i05zw5PC.eAZg2hVM8GMjgSjEIQ0CjXQDVv8Kgyy','Lyon1','Client',NULL,'CLIENT',NULL,'Lyon','69001',45.76404300,4.83565900,'2025-12-08 10:19:42','active'),(306,'cl.l2@test.com','$2b$10$fVtLgA6bIJGi.i05zw5PC.eAZg2hVM8GMjgSjEIQ0CjXQDVv8Kgyy','Lyon2','Client',NULL,'CLIENT',NULL,'Lyon','69002',45.75781400,4.83201100,'2025-12-08 10:19:42','active'),(307,'cl.l3@test.com','$2b$10$fVtLgA6bIJGi.i05zw5PC.eAZg2hVM8GMjgSjEIQ0CjXQDVv8Kgyy','Lyon3','Client',NULL,'CLIENT',NULL,'Lyon','69003',45.76223200,4.85246700,'2025-12-08 10:19:42','active'),(308,'cl.l4@test.com','$2b$10$fVtLgA6bIJGi.i05zw5PC.eAZg2hVM8GMjgSjEIQ0CjXQDVv8Kgyy','Lyon4','Client',NULL,'CLIENT',NULL,'Lyon','69004',45.77663400,4.82567800,'2025-12-08 10:19:42','active'),(309,'cl.l5@test.com','$2b$10$fVtLgA6bIJGi.i05zw5PC.eAZg2hVM8GMjgSjEIQ0CjXQDVv8Kgyy','Lyon5','Client',NULL,'CLIENT',NULL,'Lyon','69005',45.75926700,4.81234500,'2025-12-08 10:19:42','active'),(310,'cl.m1@test.com','$2b$10$fVtLgA6bIJGi.i05zw5PC.eAZg2hVM8GMjgSjEIQ0CjXQDVv8Kgyy','Mars1','Client',NULL,'CLIENT',NULL,'Marseille','13001',43.29648200,5.36978000,'2025-12-08 10:19:42','active'),(311,'cl.m2@test.com','$2b$10$fVtLgA6bIJGi.i05zw5PC.eAZg2hVM8GMjgSjEIQ0CjXQDVv8Kgyy','Mars2','Client',NULL,'CLIENT',NULL,'Marseille','13002',43.30000000,5.37000000,'2025-12-08 10:19:42','active'),(312,'cl.m3@test.com','$2b$10$fVtLgA6bIJGi.i05zw5PC.eAZg2hVM8GMjgSjEIQ0CjXQDVv8Kgyy','Mars3','Client',NULL,'CLIENT',NULL,'Marseille','13003',43.31000000,5.38000000,'2025-12-08 10:19:42','active'),(313,'cl.m4@test.com','$2b$10$fVtLgA6bIJGi.i05zw5PC.eAZg2hVM8GMjgSjEIQ0CjXQDVv8Kgyy','Mars4','Client',NULL,'CLIENT',NULL,'Marseille','13004',43.30500000,5.39000000,'2025-12-08 10:19:42','active'),(314,'cl.m5@test.com','$2b$10$fVtLgA6bIJGi.i05zw5PC.eAZg2hVM8GMjgSjEIQ0CjXQDVv8Kgyy','Mars5','Client',NULL,'CLIENT',NULL,'Marseille','13005',43.29500000,5.40000000,'2025-12-08 10:19:42','active'),(315,'cl.b1@test.com','$2b$10$fVtLgA6bIJGi.i05zw5PC.eAZg2hVM8GMjgSjEIQ0CjXQDVv8Kgyy','Bord1','Client',NULL,'CLIENT',NULL,'Bordeaux','33000',44.83778900,-0.57918000,'2025-12-08 10:19:42','active'),(316,'cl.b2@test.com','$2b$10$fVtLgA6bIJGi.i05zw5PC.eAZg2hVM8GMjgSjEIQ0CjXQDVv8Kgyy','Bord2','Client',NULL,'CLIENT',NULL,'Bordeaux','33000',44.84000000,-0.57000000,'2025-12-08 10:19:42','active'),(317,'cl.b3@test.com','$2b$10$fVtLgA6bIJGi.i05zw5PC.eAZg2hVM8GMjgSjEIQ0CjXQDVv8Kgyy','Bord3','Client',NULL,'CLIENT',NULL,'Bordeaux','33000',44.83500000,-0.58000000,'2025-12-08 10:19:42','active'),(318,'cl.b4@test.com','$2b$10$fVtLgA6bIJGi.i05zw5PC.eAZg2hVM8GMjgSjEIQ0CjXQDVv8Kgyy','Bord4','Client',NULL,'CLIENT',NULL,'Bordeaux','33000',44.83000000,-0.57500000,'2025-12-08 10:19:42','active'),(319,'cl.b5@test.com','$2b$10$fVtLgA6bIJGi.i05zw5PC.eAZg2hVM8GMjgSjEIQ0CjXQDVv8Kgyy','Bord5','Client',NULL,'CLIENT',NULL,'Bordeaux','33000',44.84500000,-0.57800000,'2025-12-08 10:19:42','active'),(320,'cl.li1@test.com','$2b$10$fVtLgA6bIJGi.i05zw5PC.eAZg2hVM8GMjgSjEIQ0CjXQDVv8Kgyy','Lille1','Client',NULL,'CLIENT',NULL,'Lille','59000',50.62925000,3.05725600,'2025-12-08 10:19:42','active'),(321,'cl.li2@test.com','$2b$10$fVtLgA6bIJGi.i05zw5PC.eAZg2hVM8GMjgSjEIQ0CjXQDVv8Kgyy','Lille2','Client',NULL,'CLIENT',NULL,'Lille','59000',50.63000000,3.06000000,'2025-12-08 10:19:42','active'),(322,'cl.li3@test.com','$2b$10$fVtLgA6bIJGi.i05zw5PC.eAZg2hVM8GMjgSjEIQ0CjXQDVv8Kgyy','Lille3','Client',NULL,'CLIENT',NULL,'Lille','59000',50.62500000,3.05000000,'2025-12-08 10:19:42','active'),(323,'cl.li4@test.com','$2b$10$fVtLgA6bIJGi.i05zw5PC.eAZg2hVM8GMjgSjEIQ0CjXQDVv8Kgyy','Lille4','Client',NULL,'CLIENT',NULL,'Lille','59000',50.63500000,3.05500000,'2025-12-08 10:19:42','active'),(324,'cl.li5@test.com','$2b$10$fVtLgA6bIJGi.i05zw5PC.eAZg2hVM8GMjgSjEIQ0CjXQDVv8Kgyy','Lille5','Client',NULL,'CLIENT',NULL,'Lille','59000',50.62800000,3.06500000,'2025-12-08 10:19:42','active'),(325,'client325@email.com','$2b$10$fVtLgA6bIJGi.i05zw5PC.eAZg2hVM8GMjgSjEIQ0CjXQDVv8Kgyy','Zoe','Faure','0699000325','CLIENT',NULL,NULL,NULL,NULL,NULL,'2025-12-08 10:48:05','active'),(326,'client326@email.com','$2b$10$fVtLgA6bIJGi.i05zw5PC.eAZg2hVM8GMjgSjEIQ0CjXQDVv8Kgyy','Noah','Rousseau','0699000326','CLIENT',NULL,NULL,NULL,NULL,NULL,'2025-12-08 10:48:05','active'),(327,'client327@email.com','$2b$10$fVtLgA6bIJGi.i05zw5PC.eAZg2hVM8GMjgSjEIQ0CjXQDVv8Kgyy','Louise','Blanc','0699000327','CLIENT',NULL,NULL,NULL,NULL,NULL,'2025-12-08 10:48:05','active'),(328,'client328@email.com','$2b$10$fVtLgA6bIJGi.i05zw5PC.eAZg2hVM8GMjgSjEIQ0CjXQDVv8Kgyy','Ethan','Guerin','0699000328','CLIENT',NULL,NULL,NULL,NULL,NULL,'2025-12-08 10:48:05','active'),(329,'client329@email.com','$2b$10$fVtLgA6bIJGi.i05zw5PC.eAZg2hVM8GMjgSjEIQ0CjXQDVv8Kgyy','Mila','Muller','0699000329','CLIENT',NULL,NULL,NULL,NULL,NULL,'2025-12-08 10:48:05','active'),(330,'client330@email.com','$2b$10$fVtLgA6bIJGi.i05zw5PC.eAZg2hVM8GMjgSjEIQ0CjXQDVv8Kgyy','Liam','Henry','0699000330','CLIENT',NULL,NULL,NULL,NULL,NULL,'2025-12-08 10:48:05','active'),(331,'client331@email.com','$2b$10$fVtLgA6bIJGi.i05zw5PC.eAZg2hVM8GMjgSjEIQ0CjXQDVv8Kgyy','Ambre','Roussel','0699000331','CLIENT',NULL,NULL,NULL,NULL,NULL,'2025-12-08 10:48:05','active'),(332,'client332@email.com','$2b$10$fVtLgA6bIJGi.i05zw5PC.eAZg2hVM8GMjgSjEIQ0CjXQDVv8Kgyy','Sacha','Nicolas','0699000332','CLIENT',NULL,NULL,NULL,NULL,NULL,'2025-12-08 10:48:05','active'),(333,'client333@email.com','$2b$10$fVtLgA6bIJGi.i05zw5PC.eAZg2hVM8GMjgSjEIQ0CjXQDVv8Kgyy','Rose','Perrin','0699000333','CLIENT',NULL,NULL,NULL,NULL,NULL,'2025-12-08 10:48:05','active'),(334,'client334@email.com','$2b$10$fVtLgA6bIJGi.i05zw5PC.eAZg2hVM8GMjgSjEIQ0CjXQDVv8Kgyy','Gabin','Morin','0699000334','CLIENT',NULL,NULL,NULL,NULL,NULL,'2025-12-08 10:48:05','active'),(335,'client335@email.com','$2b$10$fVtLgA6bIJGi.i05zw5PC.eAZg2hVM8GMjgSjEIQ0CjXQDVv8Kgyy','Anna','Mathieu','0699000335','CLIENT',NULL,NULL,NULL,NULL,NULL,'2025-12-08 10:48:05','active'),(336,'client336@email.com','$2b$10$fVtLgA6bIJGi.i05zw5PC.eAZg2hVM8GMjgSjEIQ0CjXQDVv8Kgyy','Mohamed','Clement','0699000336','CLIENT',NULL,NULL,NULL,NULL,NULL,'2025-12-08 10:48:05','active'),(337,'client337@email.com','$2b$10$fVtLgA6bIJGi.i05zw5PC.eAZg2hVM8GMjgSjEIQ0CjXQDVv8Kgyy','Mia','Gauthier','0699000337','CLIENT',NULL,NULL,NULL,NULL,NULL,'2025-12-08 10:48:05','active'),(338,'client338@email.com','$2b$10$fVtLgA6bIJGi.i05zw5PC.eAZg2hVM8GMjgSjEIQ0CjXQDVv8Kgyy','Aaron','Dumont','0699000338','CLIENT',NULL,NULL,NULL,NULL,NULL,'2025-12-08 10:48:05','active'),(339,'client339@email.com','$2b$10$fVtLgA6bIJGi.i05zw5PC.eAZg2hVM8GMjgSjEIQ0CjXQDVv8Kgyy','Julia','Lopez','0699000339','CLIENT',NULL,NULL,NULL,NULL,NULL,'2025-12-08 10:48:05','active'),(340,'client340@email.com','$2b$10$fVtLgA6bIJGi.i05zw5PC.eAZg2hVM8GMjgSjEIQ0CjXQDVv8Kgyy','Theo','Fontaine','0699000340','CLIENT',NULL,NULL,NULL,NULL,NULL,'2025-12-08 10:48:05','active');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-09 14:02:54
