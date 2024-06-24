import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Alert, Spinner, Navbar, Nav } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

const Home = () => {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPreview, setCurrentPreview] = useState(null);

    const checkTokenExpiry = async () => {
        const accessToken = sessionStorage.getItem('spotifyAccessToken');
        const tokenExpiration = sessionStorage.getItem('tokenExpiration');
    
        if (!accessToken || Date.now() >= tokenExpiration) {
            const refreshToken = sessionStorage.getItem('spotifyRefreshToken');
    
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

    const fetchRecommendations = async () => {
        const accessToken = await checkTokenExpiry();

        if (!accessToken) {
            setError('No access token found');
            setLoading(false);
            return;
        }

        console.log('Retrieved access token:', accessToken);
        console.log('Session Storage Top Artists',sessionStorage.getItem('topArtists'));
        try {
            const response = await axios.get('http://localhost:5000/recommendations', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    Artists: sessionStorage.getItem('topArtists')
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

    const handlePlayPreview = (previewUrl) => {
        if (currentPreview) {
            currentPreview.pause();
            setCurrentPreview(null);
        }
        if (previewUrl) {
            const audio = new Audio(previewUrl);
            audio.play();
            setCurrentPreview(audio);
        } else {
            setCurrentPreview(null);
        }
    };

    
    useEffect(() => {
        fetchRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty dependency array ensures this runs only once on mount

    useEffect(() => {
        return () => {
            if (currentPreview) {
                currentPreview.pause();
            }
        };
    }, [currentPreview]);



    if (loading) return (
        <div className="spinner-container">
        <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
        </Spinner>
        </div>
    );

    if (error) return (
        <>
        
        <div className="spinner-container">
            <Alert variant="danger">{error}</Alert>
        </div>
        </>
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
                            <LinkContainer to="/stats">
                                <Nav.Link>Stats</Nav.Link>    
                            </LinkContainer>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
            <Container className="mt-5">
                <h2 id='title'>Your Recommendations</h2>
                <Row>
                    {recommendations.map(track => (
                        <Col key={track.id} md={4} className="mb-4">
                            <Card className="h-100">
                                <Card.Img variant="top" src={track.album.images[0].url} alt={track.name} className="card-img" />
                                <Card.Body className="d-flex flex-column">
                                    <Card.Title>{track.name}</Card.Title>
                                    <Card.Text className="mb-4">
                                        {track.artists.map(artist => artist.name).join(', ')}
                                    </Card.Text>
                                        <Button 
                                            variant="button-card" 
                                            href={track.external_urls.spotify} 
                                            target="_blank" 
                                            className="mb-2 button-card"
                                        >
                                            Listen on Spotify
                                        </Button>
                                        <Button 
                                            variant="secondary" 
                                            onClick={() => handlePlayPreview(track.preview_url)}
                                            disabled={!track.preview_url}
                                        >
                                            {track.preview_url ? 'Play Preview' : 'No Preview Available'}
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
