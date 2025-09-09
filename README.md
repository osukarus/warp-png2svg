
# PNG to SVG Converter

This is a web application that converts PNG images into SVG format. The entire conversion process is handled client-side in the user's browser, ensuring user privacy as no files are uploaded to a server.

The application is built with Next.js, React, TypeScript, and Tailwind CSS. The core image tracing functionality is provided by the `imagetracerjs` library.

---

## Local Development

Follow these steps to run the application on your local machine.

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Run the Development Server:**
    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## Publishing to GitHub

Follow these instructions to publish your code to a new private GitHub repository under the username `ouskarus`.

1.  **Initialize Git:**
    Open a terminal in the project directory and run:
    ```bash
    git init -b main
    ```

2.  **Create a New Repository on GitHub:**
    Go to [github.com/new](https://github.com/new) to create a new repository.
    -   **Owner:** `ouskarus`
    -   **Repository name:** Choose a name (e.g., `warp-png2svg`)
    -   Select **Private**

3.  **Add and Commit Your Files:**
    Run the following commands in your terminal:
    ```bash
    git add .
    git commit -m "Initial commit: Setup PNG to SVG converter"
    ```

4.  **Link and Push to GitHub:**
    Replace `<repository_url>` with the URL from the repository you just created on GitHub (it looks like `https://github.com/ouskarus/your-repo-name.git`).
    ```bash
    git remote add origin <repository_url>
    git push -u origin main
    ```

---

## Deployment to Sevalla

This project is configured to be deployed on **Sevalla's free static site hosting**.

1.  **Sign Up:**
    Create an account on [www.sevalla.com](https://www.sevalla.com).

2.  **Build the Static Site:**
    Run the build command in your terminal. This generates a static version of your site in a folder named `out`.
    ```bash
    npm run build
    ```

3.  **Deploy on Sevalla:**
    -   Log in to your Sevalla account.
    -   Navigate to the dashboard section for creating a new **Static Site**.
    -   Follow the on-screen instructions to upload the contents of the `out` directory that was generated in the previous step.
    -   Once the upload is complete, Sevalla will provide you with a public URL for your live site.
