import React from 'react';

const Login = () => {
    const loginUrl = 'http://localhost:5000/login';

    return (
        <div>
            <h1>Spotify Recommender</h1>
            <a href={loginUrl}>Login with Spotify</a>
        </div>
    );
};

export default Login;
