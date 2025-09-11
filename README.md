
<img width="886" height="400" alt="quik-do-repo-image" src="https://github.com/user-attachments/assets/987c85fd-0df6-4067-97e3-a326a9b15a20" />

# Quik-do
Quik-do is a simple, modern, and high-performance to-do list application that allows users to manage their tasks efficiently. It provides features like creating, editing, deleting, and marking tasks as complete. The application is designed to be fast, responsive, and accessible from any device with a web browser.

---

### Demo

Check out the live demo [here](https://ghassanelgendy.github.io/quik-do/).

For more detailed information, please see the full [documentation](https://github.com/ghassanelgendy/quik-do/blob/main/documentation.pdf).

---

### Architecture
<img width="2550" height="1250" alt="infrastructure architecture diagram" src="https://github.com/user-attachments/assets/b4d9ade2-5323-422d-bee4-f42a2edbdce0" />

The Quik-do application follows a robust, purely serverless architecture, leveraging various AWS services to provide a scalable, cost-effective, and highly available solution.

1.  **Frontend Deployment**: Static assets (HTML, CSS, JavaScript) of the React application are hosted on **Amazon S3** and delivered globally through **Amazon CloudFront**, a Content Delivery Network (CDN), ensuring low-latency access for users worldwide.
2.  **Authentication**: User authentication, including sign-up, sign-in, and session management, is handled by **Firebase Authentication**, providing a secure and seamless experience with lambda Authorizer in the API Gateway
3.  **Backend API**: All backend operations are exposed via a REST API managed by **Amazon API Gateway**. This gateway acts as the single entry point for frontend requests.
4.  **Business Logic**: API Gateway triggers **AWS Lambda** functions, which contain the core business logic for handling various CRUD (Create, Read, Update, Delete) operations on to-do items and tags.
5.  **Data Persistence**: **Amazon DynamoDB**, a highly scalable and performant NoSQL database, is used to store all application data, including user tasks and tags.
6.  **CI/CD**: The entire deployment process is automated using **AWS CodeBuild**, ensuring consistent and reliable updates.

---

### Tech Stack

#### Frontend

* **Framework**: Developed as a single-page application (SPA) using **React**, ensuring a dynamic and responsive user interface.
* **Hosting**: Static website assets are hosted on **Amazon S3** and served efficiently via **Amazon CloudFront**.
* **Deployment**: Automated build and deployment are managed through **AWS CodeBuild**.

#### Backend

* **API Gateway**: **Amazon API Gateway** provides a robust and scalable REST API endpoint (`https://by489qc8yj.execute-api.eu-west-1.amazonaws.com`) for all backend interactions.
* **Authentication**: **Firebase Authentication** secures the API. The frontend obtains a JWT token from Firebase post-authentication, used for authorizing all subsequent API requests.
* **Business Logic**: Implemented using **AWS Lambda** functions, offering a serverless approach to handle request processing.
* **Database**: **Amazon DynamoDB** serves as the NoSQL database for fast and predictable data storage and retrieval.

---

### API Endpoints

The application interacts with the following main API endpoints for managing todos and tags:

#### Todos

* **`GET /todos`**
    * **Description**: Retrieves all to-do items for the authenticated user.
    * **Request Headers**: `Authorization: Bearer <FIREBASE_ID_TOKEN>`
    * **Response (200 OK)**: A JSON array of todo objects.
        ```json
        [
          {
            "id": "<TODO_ID>",
            "title": "<TODO_TITLE>",
            "description": "<TODO_DESCRIPTION>",
            "completed": false,
            "createdAt": "<TIMESTAMP>",
            "updatedAt": "<TIMESTAMP>"
          }
        ]
        ```
* **`PUT /todos`**
    * **Description**: Creates a new to-do item or updates an existing one.
    * **Request Headers**: `Authorization: Bearer <FIREBASE_ID_TOKEN>`
    * **Request Body**:
        ```json
        {
          "id": "<TODO_ID>",
          "title": "<TODO_TITLE>",
          "description": "<TODO_DESCRIPTION>",
          "completed": false
        }
        ```
    * **Response (200 OK)**: The created or updated todo object.
        ```json
        {
          "id": "<TODO_ID>",
          "title": "<TODO_TITLE>",
          "description": "<TODO_DESCRIPTION>",
          "completed": false,
          "createdAt": "<TIMESTAMP>",
          "updatedAt": "<TIMESTAMP>"
        }
        ```
* **`DELETE /todos/{id}`**
    * **Description**: Deletes a specific to-do item by its ID.
    * **Request Headers**: `Authorization: Bearer <FIREBASE_ID_TOKEN>`
    * **Response (204 No Content)**

#### Tags

* **`GET /tags`**
    * **Description**: Retrieves all tags for the authenticated user.
    * **Request Headers**: `Authorization: Bearer <FIREBASE_ID_TOKEN>`
    * **Response (200 OK)**: A JSON array of tag objects.
        ```json
        [
          {
            "id": "<TAG_ID>",
            "name": "<TAG_NAME>"
          }
        ]
        ```
* **`DELETE /tags/{id}`**
    * **Description**: Deletes a specific tag by its ID.
    * **Request Headers**: `Authorization: Bearer <FIREBASE_ID_TOKEN>`
    * **Response (204 No Content)**

---

### Getting Started

To get a local copy up and running, follow these simple steps.

#### Prerequisites

You need to have `npm` installed on your system.

```sh
npm install npm@latest -g
````

#### Installation

1.  Clone the repo
    ```sh
    git clone https://github.com/ghassanelgendy/quik-do.git
    ```
2.  Install NPM packages
    ```sh
    npm install
    ```
3.  Run the app
    ```sh
    npm start
    ```

-----

### Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

-----

### License

Distributed under the MIT License. See `LICENSE` for more information.

-----

### Contact

Ghassan Elgendy - [@ghassanelgendy](https://www.linkedin.com/in/ghassanelgendy/) - [ghassanelgendyy@gmail.com](mailto:ghassanelgendyy@gmail.com)

Project Link: [https://github.com/ghassanelgendy/quik-do](https://github.com/ghassanelgendy/quik-do)
