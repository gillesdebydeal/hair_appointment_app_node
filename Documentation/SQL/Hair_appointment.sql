-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: hair_appointment
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

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
) ENGINE=InnoDB AUTO_INCREMENT=325 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-08 11:30:41
