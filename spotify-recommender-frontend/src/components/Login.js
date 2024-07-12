import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import axios from 'axios';

const Login = () => {
    const [clientId, setClientId] = useState('');
    const [redirectUri, setRedirectUri] = useState('');

    useEffect(() => {
        const fetchClientId = async () => {
            try {
                console.log('Fetching client ID...');
                const response = await axios.get('http://localhost:5000/spotify-client-id');
                console.log('Response:', response.data);
                setClientId(response.data.CLIENT_ID);
                setRedirectUri(response.data.REDIRECT_URI);
            } catch (error) {
                console.error('Error fetching client ID:', error);
            }
        };

        fetchClientId();
    }, []);

    const handleLogin = () => {
        const scopes = [
            'user-read-private',
            'user-read-email',
            'playlist-read-private',
            'playlist-read-collaborative',
            'user-library-read',
            'user-top-read'
        ];
        const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes.join(' '))}`;
        console.log('Redirecting to:', authUrl);
        window.location.href = authUrl;
    };

    return (
        <Container className="d-flex align-items-center justify-content-center min-vh-100">
            <Row className="w-100 justify-content-center">
                <Col md={6} lg={4}>
                    <Card>
                        <Card.Body>
                            <h2 className="text-center mb-4">Music Recommender</h2>
                            <Button variant="primary" className="w-100 mt-4" onClick={handleLogin} disabled={!clientId}>
                                Login with Spotify
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Login;
