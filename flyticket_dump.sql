CREATE DATABASE  IF NOT EXISTS `flyticket` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `flyticket`;
-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: flyticket
-- ------------------------------------------------------
-- Server version	8.0.40

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
-- Table structure for table `admins`
--

DROP TABLE IF EXISTS `admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admins` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admins`
--

LOCK TABLES `admins` WRITE;
/*!40000 ALTER TABLE `admins` DISABLE KEYS */;
INSERT INTO `admins` VALUES (2,'admin','$2a$12$xOJTijN8Z.CCmJeXXGERJeOdQ5gwxX9zdf/b3SE33j9VnMKuCX4ZG','2026-05-01 14:05:08');
/*!40000 ALTER TABLE `admins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `airlines`
--

DROP TABLE IF EXISTS `airlines`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `airlines` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `airlines`
--

LOCK TABLES `airlines` WRITE;
/*!40000 ALTER TABLE `airlines` DISABLE KEYS */;
INSERT INTO `airlines` VALUES (1,'Türk Hava Yolları','THY','2026-05-03 12:20:50'),(2,'PEGASUS','PGS','2026-05-03 12:21:09'),(3,'SUNEXPRESS','SUN','2026-05-03 12:21:28'),(4,'EMIRATES','ES','2026-05-04 21:56:39');
/*!40000 ALTER TABLE `airlines` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cities`
--

DROP TABLE IF EXISTS `cities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cities` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=82 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cities`
--

LOCK TABLES `cities` WRITE;
/*!40000 ALTER TABLE `cities` DISABLE KEYS */;
INSERT INTO `cities` VALUES (1,'Adana'),(2,'Adıyaman'),(3,'Afyonkarahisar'),(4,'Ağrı'),(68,'Aksaray'),(5,'Amasya'),(6,'Ankara'),(7,'Antalya'),(75,'Ardahan'),(8,'Artvin'),(9,'Aydın'),(10,'Balıkesir'),(74,'Bartın'),(72,'Batman'),(69,'Bayburt'),(11,'Bilecik'),(12,'Bingöl'),(13,'Bitlis'),(14,'Bolu'),(15,'Burdur'),(16,'Bursa'),(17,'Çanakkale'),(18,'Çankırı'),(19,'Çorum'),(20,'Denizli'),(21,'Diyarbakır'),(81,'Düzce'),(22,'Edirne'),(23,'Elazığ'),(24,'Erzincan'),(25,'Erzurum'),(26,'Eskişehir'),(27,'Gaziantep'),(28,'Giresun'),(29,'Gümüşhane'),(30,'Hakkari'),(31,'Hatay'),(76,'Iğdır'),(32,'Isparta'),(34,'İstanbul'),(35,'İzmir'),(46,'Kahramanmaraş'),(78,'Karabük'),(70,'Karaman'),(36,'Kars'),(37,'Kastamonu'),(38,'Kayseri'),(79,'Kilis'),(71,'Kırıkkale'),(39,'Kırklareli'),(40,'Kırşehir'),(41,'Kocaeli'),(42,'Konya'),(43,'Kütahya'),(44,'Malatya'),(45,'Manisa'),(47,'Mardin'),(33,'Mersin'),(48,'Muğla'),(49,'Muş'),(50,'Nevşehir'),(51,'Niğde'),(52,'Ordu'),(80,'Osmaniye'),(53,'Rize'),(54,'Sakarya'),(55,'Samsun'),(63,'Şanlıurfa'),(56,'Siirt'),(57,'Sinop'),(58,'Sivas'),(73,'Şırnak'),(59,'Tekirdağ'),(60,'Tokat'),(61,'Trabzon'),(62,'Tunceli'),(64,'Uşak'),(65,'Van'),(77,'Yalova'),(66,'Yozgat'),(67,'Zonguldak');
/*!40000 ALTER TABLE `cities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `flights`
--

DROP TABLE IF EXISTS `flights`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `flights` (
  `id` int NOT NULL AUTO_INCREMENT,
  `flight_number` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `departure_city_id` int NOT NULL,
  `arrival_city_id` int NOT NULL,
  `departure_time` datetime NOT NULL,
  `arrival_time` datetime NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `seats_total` int NOT NULL DEFAULT '100',
  `seats_available` int NOT NULL DEFAULT '100',
  `departure_hour_slot` varchar(20) COLLATE utf8mb4_unicode_ci GENERATED ALWAYS AS (date_format(`departure_time`,_utf8mb4'%Y%m%d%H')) STORED,
  `arrival_hour_slot` varchar(20) COLLATE utf8mb4_unicode_ci GENERATED ALWAYS AS (date_format(`arrival_time`,_utf8mb4'%Y%m%d%H')) STORED,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `airline_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `flight_number` (`flight_number`),
  UNIQUE KEY `uq_departure_slot` (`departure_city_id`,`departure_hour_slot`),
  UNIQUE KEY `uq_arrival_slot` (`arrival_city_id`,`arrival_hour_slot`),
  CONSTRAINT `flights_ibfk_1` FOREIGN KEY (`departure_city_id`) REFERENCES `cities` (`id`),
  CONSTRAINT `flights_ibfk_2` FOREIGN KEY (`arrival_city_id`) REFERENCES `cities` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `flights`
--

LOCK TABLES `flights` WRITE;
/*!40000 ALTER TABLE `flights` DISABLE KEYS */;
INSERT INTO `flights` (`id`, `flight_number`, `departure_city_id`, `arrival_city_id`, `departure_time`, `arrival_time`, `price`, `seats_total`, `seats_available`, `created_at`, `airline_id`) VALUES (15,'DNM1',2,12,'2026-05-16 15:21:00','2026-05-16 18:21:00',1000.00,100,93,'2026-05-03 12:22:12',2),(17,'dnm22',9,13,'2026-05-10 00:05:00','2026-05-10 02:07:00',1000.00,100,93,'2026-05-03 19:04:13',1),(18,'qweqw123123',5,13,'2026-05-03 23:08:00','2026-05-04 00:10:00',1000.00,100,97,'2026-05-03 19:08:50',3),(19,'qweqwe213123',1,66,'2026-05-09 00:11:00','2026-05-09 03:13:00',5000.00,5,0,'2026-05-03 19:09:29',3),(20,'qweqweqwe123123',48,7,'2026-05-04 00:31:00','2026-05-04 01:32:00',20.00,100,99,'2026-05-03 19:29:49',3),(21,'deneme123',69,71,'2026-05-15 01:56:00','2026-05-15 04:01:00',1000.00,100,100,'2026-05-04 21:57:41',4),(22,'qweqwe123123213',9,12,'2026-05-10 02:59:00','2026-05-10 05:59:00',1000.00,100,100,'2026-05-04 21:59:48',NULL);
/*!40000 ALTER TABLE `flights` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tickets`
--

DROP TABLE IF EXISTS `tickets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tickets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `flight_id` int NOT NULL,
  `passenger_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `passenger_surname` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `passenger_email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `booking_reference` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `booked_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `seat_number` int NOT NULL DEFAULT '0',
  `user_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `booking_reference` (`booking_reference`),
  UNIQUE KEY `uq_flight_seat` (`flight_id`,`seat_number`),
  CONSTRAINT `tickets_ibfk_1` FOREIGN KEY (`flight_id`) REFERENCES `flights` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tickets`
--

LOCK TABLES `tickets` WRITE;
/*!40000 ALTER TABLE `tickets` DISABLE KEYS */;
INSERT INTO `tickets` VALUES (8,15,'qwe','Mert','ngun@gmail.com','BQMMDKS5QH','2026-05-03 12:44:49',1,NULL),(9,15,'qwe','qwe','as@gmail.com','CBWIJW15EC','2026-05-03 12:45:26',2,NULL),(10,15,'qwe','qweqwe','mertsengun09@gmail.com','6LGS1HLBGZ','2026-05-03 12:46:38',3,NULL),(11,15,'qwe','Mert','mertsengun09@gmail.com','LIJ4QQ1SPV','2026-05-03 12:47:04',4,NULL),(12,15,'qwe','Mert','mertsengun09@gmail.com','95WURMESRF','2026-05-03 12:47:04',5,NULL),(13,15,'qwe','qwe','qweq@gmail.com','KWNSRAOXCN','2026-05-03 13:07:16',35,NULL),(14,15,'ucan','fare','ucanfare@gmail.com','X9ZHLDHHSO','2026-05-03 13:30:40',31,1),(15,17,'qwe','qwe','qwe@gmail.com','24YPITBCN2','2026-05-03 19:05:35',1,NULL),(16,17,'qwe','qwe','qwe@gmail.com','83RFDL1P15','2026-05-03 19:05:35',2,NULL),(17,17,'qwe','qwe','qwe@gmail.com','A6WVTRQ5YR','2026-05-03 19:05:35',3,NULL),(18,17,'qwe','qwe','qwe@gmail.com','DY2QIHLOMC','2026-05-03 19:05:35',4,NULL),(19,17,'qwe','qwe','qwe@gmail.com','VH4DB1IMBN','2026-05-03 19:05:35',5,NULL),(20,17,'qwe','qwe','qwe@gmail.com','4UB0B7ULM3','2026-05-03 19:05:35',6,NULL),(21,17,'qwe','qwe','qwe@gmail.com','V937LOXCQC','2026-05-03 19:05:35',7,NULL),(22,19,'qwe','qwe','qwe@gmail.com','YOKUA3Q1NN','2026-05-03 19:09:56',1,NULL),(23,19,'qwe','qwe','qwe@gmail.com','D05KEWNRZA','2026-05-03 19:09:56',2,NULL),(24,19,'qwe','qwe','qwe@gmail.com','O0OZY560T','2026-05-03 19:09:56',3,NULL),(25,19,'qwe','qwe','qwe@gmail.com','7G38MJYFVG','2026-05-03 19:09:56',4,NULL),(26,19,'qwe','qwe','qwe@gmail.com','PP13DHROL6','2026-05-03 19:09:56',5,NULL),(27,20,'qweqwe','qweqweqw','qweqweqw@gmail.com','S5L1J1FLYK','2026-05-03 19:30:48',2,NULL),(28,18,'Eren','subasi','esubasi205@gmail.com','WRXH6E6DLG','2026-05-03 21:45:11',1,NULL),(30,18,'qweqwe','qweqwe','ornek@gmail.com','ZIFNKZ5P44','2026-05-04 21:55:07',2,2),(31,18,'qweqwe','qweqwe','qwe@gmail.com','44FUA9V418','2026-05-16 13:08:57',28,NULL);
/*!40000 ALTER TABLE `tickets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `surname` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'ucan','fare','ucanfare@gmail.com','$2a$10$Dmw/8HI.q3YvhvMoC/dCzOoDl5jDZueYur8YCniZai3wtC9HPs/ji','2026-05-03 13:30:11'),(2,'qweqwe','qweqwe','ornek@gmail.com','$2a$10$9CK5UeJ1VwoUYwszHxF/yed9N5SDsghnwrqi2Gmssip/jDyZbQnqW','2026-05-04 21:54:23');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-16 16:16:28
