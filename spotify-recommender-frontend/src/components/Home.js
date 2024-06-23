import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Alert, Spinner, Navbar, Nav } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

const Home = () => {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const checkTokenExpiry = async () => {
        const accessToken = sessionStorage.getItem('spotifyAccessToken');
        const tokenExpiration = sessionStorage.getItem('tokenExpiration');
    
        if (!accessToken || Date.now() >= tokenExpiration) {
            const refreshToken = localStorage.getItem('spotifyRefreshToken');
    
            if (!refreshToken) {
                // Handle case where no refresh token is available
                throw new Error('No refresh token available');
            }
    
            try {
                const response = await axios.post('http://localhost:5000/refresh_token', {
                    refresh_token: refreshToken
                });
    
                const { access_token, expires_in } = response.data;
    
                // Update localStorage with new token and expiration
                sessionStorage.setItem('spotifyAccessToken', access_token);
                sessionStorage.setItem('tokenExpiration', Date.now() + expires_in * 1000);
    
                return access_token;
            } catch (err) {
                console.error('Error refreshing token:', err);
                throw new Error('Error refreshing token');
            }
        }
    
        return accessToken;
    };
    

    useEffect(() => {
        const fetchRecommendations = async () => {
            const accessToken = await checkTokenExpiry();

            if (!accessToken) {
                setError('No access token found');
                setLoading(false);
                return;
            }

            console.log('Retrieved access token:', accessToken);

            try {
                const response = await axios.get('http://localhost:5000/recommendations', {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                });

                console.log("tracks:", response.data);
                setRecommendations(response.data || []);
                setLoading(false);
            } catch (err) {
                setError('Error fetching recommendations');
                setLoading(false);
            }
        };

        fetchRecommendations();
    }, []);

    if (loading) return (
        <div className="spinner-container">
        <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
        </Spinner>
        </div>
    );

    if (error) return (
        <Container className="mt-5">
            <Alert variant="danger">{error}</Alert>
        </Container>
    );

    return (
        <>
            <Navbar bg="dark" variant="dark" expand="lg">
                <Container>
                    <Navbar.Brand href="/">Spotify Recommender</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                            <LinkContainer to="/home">
                                <Nav.Link>Home</Nav.Link>
                            </LinkContainer>
                            {/* Add more links here if needed */}
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
            <Container className="mt-5">
                <h2 id='title'>Spotify Recommendations</h2>
                <Row>
                    {recommendations.map(track => (
                        <Col key={track.id} md={4} className="mb-4">
                            <Card>
                                <Card.Img variant="top" src={track.album.images[0].url} alt={track.name} />
                                <Card.Body>
                                    <Card.Title>{track.name}</Card.Title>
                                    <Card.Text>
                                        {track.artists.map(artist => artist.name).join(', ')}
                                    </Card.Text>
                                    <Button variant="primary" href={track.external_urls.spotify} target="_blank">
                                        Listen on Spotify
                                    </Button>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Container>
        </>
    );
};

export default Home;
