\documentclass[a4paper,12pt]{article}
\usepackage[utf8]{inputenc}
\usepackage{hyperref}
\usepackage{xcolor}
\usepackage{enumitem}
\usepackage{titlesec}
\usepackage{geometry}
\geometry{margin=1in}

\titleformat{\section}
  {\large\bfseries}
  {}{0pt}{}

\hypersetup{
    colorlinks=true,
    linkcolor=blue,
    urlcolor=cyan
}

\begin{document}

\begin{center}
    {\huge \textbf{Real-Time Chat Application}}\\[1ex]
    \textbf{Built with Next.js, Node.js, Socket.IO, and MongoDB}
\end{center}

\vspace{1em}

\section*{Overview}
A modern, full-stack real-time chat application featuring instant messaging, chat previews, real-time updates, and secure authentication. This project is crafted using a cutting-edge tech stack suitable for scalable and performant web applications.

\section*{Features}
\begin{itemize}[leftmargin=*, label=\textbullet]
    \item \textbf{User Authentication}: JWT-based sign up/login with secure password hashing via bcrypt.
    \item \textbf{Real-Time Messaging}: Instant delivery of messages using Socket.IO with support for chat-specific threads.
    \item \textbf{Chat List Previews}: Latest message preview, real-time updates, and unread message counts.
    \item \textbf{State Management}: Centralized state using Redux Toolkit.
    \item \textbf{Responsive Frontend}: Built with Next.js and Chakra UI, featuring accessible and mobile-friendly design.
\end{itemize}

\section*{Technology Stack}
\begin{tabular}{|l|l|}
    \hline
    \textbf{Technology} & \textbf{Role} \\
    \hline
    Next.js & Frontend Framework \\
    Chakra UI & UI Components and Styling \\
    Redux Toolkit & State Management \\
    Node.js + Express & Backend API \\
    MongoDB + Mongoose & NoSQL Database \\
    Socket.IO & Real-Time Messaging \\
    JWT & Authentication \\
    bcrypt & Password Encryption \\
    \hline
\end{tabular}

\section*{Setup Instructions}

\subsection*{Backend Setup}
\begin{enumerate}[leftmargin=*, label=\arabic*.]
    \item Clone the repository:
    \begin{verbatim}
git clone https://github.com/yourusername/chat-app.git
cd chat-app/backend
    \end{verbatim}
    \item Install dependencies:
    \begin{verbatim}
npm install
    \end{verbatim}
    \item Create a \texttt{.env} file:
    \begin{verbatim}
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
    \end{verbatim}
    \item Start the server:
    \begin{verbatim}
npm start
    \end{verbatim}
\end{enumerate}

\subsection*{Frontend Setup}
\begin{enumerate}[leftmargin=*, label=\arabic*.]
    \item Navigate to the frontend folder:
    \begin{verbatim}
cd ../frontend
    \end{verbatim}
    \item Install dependencies:
    \begin{verbatim}
npm install
    \end{verbatim}
    \item Run the Next.js app:
    \begin{verbatim}
npm run dev
    \end{verbatim}
\end{enumerate}

\textbf{Application URL:} \url{http://localhost:3000}

\section*{Project Structure}
\begin{verbatim}
chat-app/
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── server.js
│
└── frontend/
    ├── components/
    ├── features/ (Redux slices)
    ├── pages/
    └── utils/
\end{verbatim}

\section*{Future Enhancements}
\begin{itemize}[leftmargin=*, label=\textbullet]
    \item Group chats and broadcast messaging
    \item Message reactions with emojis
    \item File sharing support (images, videos, documents)
    \item Push notifications
    \item Online/offline user indicators
\end{itemize}

\section*{License}
This project is licensed under the \textbf{MIT License} \\
\textcopyright{}
2025 Muneeb U Rehman

\end{document}
