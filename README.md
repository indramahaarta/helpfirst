# HelpFirst App

Welcome to the HelpFirst App project! This App provides functionality to report an accident and request for help!

## Table of Contents

- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
- [Usage](#usage)
  - [Running the Server](#running-the-server)
  - [API Documentation](#api-documentation)
- [License](#license)

## Getting Started

### Prerequisites

Ensure you have the following tools installed on your machine:

- [Docker](https://hub.docker.com/)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/indramahaarta/helpfirst.git
    cd helpfirst

    ```

### Configuration

1.  **Configure env file:**

    Make a copy from .env.example and fill all the configuration

## Usage

### Running the Server using /script/setup.sh (docker-compose)

```bash
  chmod +x ./script/setup.sh && ./script/setup.sh
```

Then, open http://localhost:3000 to preview the frontend

# API Documentation

To access the API documentation, visit the Swagger documentation at `http://localhost:8080/swagger/index.html` after starting the server.
