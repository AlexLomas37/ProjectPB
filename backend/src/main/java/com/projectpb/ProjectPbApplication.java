package com.projectpb;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@org.springframework.data.mongodb.config.EnableMongoAuditing
public class ProjectPbApplication {

	public static void main(String[] args) {
		SpringApplication.run(ProjectPbApplication.class, args);
	}

}

