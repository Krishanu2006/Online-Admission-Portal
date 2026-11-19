-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: iem_admission
-- ------------------------------------------------------
-- Server version	8.0.46

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
-- Current Database: `iem_admission`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `iem_admission` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `iem_admission`;

--
-- Table structure for table `admission_cycles`
--

DROP TABLE IF EXISTS `admission_cycles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admission_cycles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cycle_name` varchar(100) NOT NULL,
  `academic_year` varchar(20) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `status` enum('UPCOMING','ACTIVE','CLOSED') NOT NULL DEFAULT 'UPCOMING',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admission_cycles`
--

LOCK TABLES `admission_cycles` WRITE;
/*!40000 ALTER TABLE `admission_cycles` DISABLE KEYS */;
/*!40000 ALTER TABLE `admission_cycles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `courses`
--

DROP TABLE IF EXISTS `courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `courses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `course_code` varchar(30) NOT NULL,
  `course_name` varchar(150) NOT NULL,
  `degree` varchar(50) NOT NULL,
  `duration_years` int NOT NULL,
  `department_id` int NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `course_code` (`course_code`),
  KEY `fk_courses_department` (`department_id`),
  CONSTRAINT `fk_courses_department` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courses`
--

LOCK TABLES `courses` WRITE;
/*!40000 ALTER TABLE `courses` DISABLE KEYS */;
/*!40000 ALTER TABLE `courses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `departments`
--

DROP TABLE IF EXISTS `departments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `departments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `department_code` varchar(20) NOT NULL,
  `department_name` varchar(150) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `department_code` (`department_code`),
  UNIQUE KEY `department_name` (`department_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departments`
--

LOCK TABLES `departments` WRITE;
/*!40000 ALTER TABLE `departments` DISABLE KEYS */;
/*!40000 ALTER TABLE `departments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_id_sequence`
--

DROP TABLE IF EXISTS `user_id_sequence`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_id_sequence` (
  `sequence_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`sequence_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_id_sequence`
--

LOCK TABLES `user_id_sequence` WRITE;
/*!40000 ALTER TABLE `user_id_sequence` DISABLE KEYS */;
INSERT INTO `user_id_sequence` VALUES (1,'2026-10-27 17:23:40'),(2,'2026-10-27 18:20:04');
/*!40000 ALTER TABLE `user_id_sequence` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_password_versions`
--

DROP TABLE IF EXISTS `user_password_versions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_password_versions` (
  `version_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_pk` bigint unsigned NOT NULL,
  `user_id` varchar(32) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` varchar(32) NOT NULL,
  `last_update_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_update_by` varchar(32) NOT NULL,
  `effective_start_date` datetime NOT NULL,
  `effective_end_date` datetime DEFAULT NULL,
  `active_user_pk` bigint unsigned GENERATED ALWAYS AS ((case when (`effective_end_date` is null) then `user_pk` else NULL end)) STORED,
  PRIMARY KEY (`version_id`),
  UNIQUE KEY `uq_one_active_password_version` (`active_user_pk`),
  KEY `idx_password_history` (`user_pk`,`effective_start_date`),
  KEY `idx_password_versions_user_id` (`user_id`,`effective_start_date`),
  CONSTRAINT `fk_password_history_user` FOREIGN KEY (`user_pk`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_password_versions`
--

LOCK TABLES `user_password_versions` WRITE;
/*!40000 ALTER TABLE `user_password_versions` DISABLE KEYS */;
INSERT INTO `user_password_versions` (`version_id`, `user_pk`, `user_id`, `password_hash`, `created_date`, `created_by`, `last_update_date`, `last_update_by`, `effective_start_date`, `effective_end_date`) VALUES (1,1,'271020262253401','$2b$12$Le9sbozjLTb4Yrt3XFJzAeFqoyrQd7qvKw.wU89yiF.Ox7DR1/RMi','2026-10-27 17:23:40','271020262253401','2026-10-27 17:23:40','271020262253401','2026-10-27 17:23:40',NULL),(2,2,'271020262350042','$2b$12$EPkLo3BNmsx4Tn1zH43nzuS7o1zBXZ.a8UEockXTQzXg40ASvtOJy','2026-10-27 18:20:04','271020262350042','2026-10-27 18:20:04','271020262350042','2026-10-27 18:20:04',NULL);
/*!40000 ALTER TABLE `user_password_versions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` varchar(32) NOT NULL,
  `fname` varchar(100) NOT NULL,
  `lname` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone_number` varchar(20) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('STUDENT','ADMIN') NOT NULL DEFAULT 'STUDENT',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` varchar(32) NOT NULL,
  `last_update_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_update_by` varchar(32) NOT NULL,
  `effective_start_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `effective_end_date` datetime DEFAULT NULL,
  `password_changed_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `must_change_password` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_user_id` (`user_id`),
  UNIQUE KEY `uq_users_email` (`email`),
  UNIQUE KEY `uq_users_phone` (`phone_number`),
  KEY `idx_users_effective_dates` (`user_id`,`effective_start_date`,`effective_end_date`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'271020262253401','ABCDEFG','bjkk','abbc@gmail.com','2262265577','$2b$12$Le9sbozjLTb4Yrt3XFJzAeFqoyrQd7qvKw.wU89yiF.Ox7DR1/RMi','STUDENT',1,'2026-10-27 17:23:40','271020262253401','2026-10-27 17:23:40','271020262253401','2026-10-27 17:23:40',NULL,'2026-10-27 17:23:40',0),(2,'271020262350042','abcde','fghui','abcd@gmail.com','9480247856','$2b$12$EPkLo3BNmsx4Tn1zH43nzuS7o1zBXZ.a8UEockXTQzXg40ASvtOJy','STUDENT',1,'2026-10-27 18:20:04','271020262350042','2026-10-27 18:20:04','271020262350042','2026-10-27 18:20:04',NULL,'2026-10-27 18:20:04',0);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'iem_admission'
--

--
-- Dumping routines for database 'iem_admission'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-17 12:27:31
