-- MySQL dump 10.13  Distrib 8.0.34, for Win64 (x86_64)
--
-- Host: localhost    Database: chaigpt
-- ------------------------------------------------------
-- Server version	8.0.34

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
-- Current Database: `chaigpt`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `chaigpt` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `chaigpt`;

--
-- Table structure for table `sales`
--

DROP TABLE IF EXISTS `sales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sales` (
  `sale_id` varchar(50) NOT NULL,
  `user_id` varchar(70) NOT NULL,
  `vendor_name` text,
  `weight` double DEFAULT NULL,
  `rate_per_kg` double DEFAULT NULL,
  `price` double DEFAULT NULL,
  `discount` double DEFAULT NULL,
  `net` double DEFAULT NULL,
  `timestamp` datetime DEFAULT NULL,
  PRIMARY KEY (`sale_id`,`user_id`),
  KEY `user_f_k` (`user_id`),
  CONSTRAINT `user_f_k` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sales`
--

LOCK TABLES `sales` WRITE;
/*!40000 ALTER TABLE `sales` DISABLE KEYS */;
INSERT INTO `sales` VALUES ('211NFu0wWUMBi9IlRDVf2DGMfOtLLPzZhS3M6C6QeBM=','2Jsat5zGMi2DgoJzHLrxZTgzIUeq45eJlD0kMW9v4G0=','Raju Bhai',107.14285714285714,2.8,300,300,0,'2024-12-16 16:48:07'),('6G41fgC9QLuU0ysR5UNj3AjZq6bPvJkmf5eZxum5t3o=','2Jsat5zGMi2DgoJzHLrxZTgzIUeq45eJlD0kMW9v4G0=','Chand Bhai',107.14285714285714,2.8,300,10,290,'2024-12-16 17:19:30'),('fKGHcVz2ZwA6d6wQ8TdKBNvpIk5F8N3D6KPZ73eBLCg=','2Jsat5zGMi2DgoJzHLrxZTgzIUeq45eJlD0kMW9v4G0=','Ram Bhai',58.82,3.4,200,10,190,'2024-12-16 17:24:22'),('fUN9xTRvebjbl7sPml0ahdkzzItxNeY7cPQKRX25DOc=','2Jsat5zGMi2DgoJzHLrxZTgzIUeq45eJlD0kMW9v4G0=','Chry',24,1.66,10,10,0,'2024-12-10 23:03:38'),('GirPF252g4hmJX1p8xzHRWuyUHbZXjeUCKV/c6e9pvM=','2Jsat5zGMi2DgoJzHLrxZTgzIUeq45eJlD0kMW9v4G0=','Chedery',24,1.66,10,10,0,'2024-12-10 23:03:38'),('I4PSXb9MWGkGmKLh7/dS0Yc80y2a1kaVpDF/c+KWDtg=','2Jsat5zGMi2DgoJzHLrxZTgzIUeq45eJlD0kMW9v4G0=','Vimal Bhai',125,2.4,300,50,250,'2024-12-15 15:42:52'),('mV6UC3JrpVJ4JbkEoYgr6kZAHNnBWgBGGmCiuril5WU=','2Jsat5zGMi2DgoJzHLrxZTgzIUeq45eJlD0kMW9v4G0=','Vijay Bhai',3.571,2.8,10,2,8,'2024-12-16 17:28:35');
/*!40000 ALTER TABLE `sales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` varchar(70) NOT NULL,
  `email` text,
  `password` varchar(70) DEFAULT NULL,
  `address` text,
  `phone_no` text,
  `user_name` text,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('2Jsat5zGMi2DgoJzHLrxZTgzIUeq45eJlD0kMW9v4G0=','aniketpoptani100@gmail.com','$2b$10$1sJ3vaGQdebiuF.4mM.I0.hUKJSspRLpZROURuudu/M0ux0TgF4Vq','B-New, 47/482, Near Gidwani Park, Sant Hirdaram Nagar','07999733632','Aniket');
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

-- Dump completed on 2024-12-20  0:41:11
