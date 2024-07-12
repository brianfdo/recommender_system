import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Alert, Spinner, Navbar, Nav } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

const Explore = () => {
    const [recommendations, setRecommendedTracks] = useState([]);
    // const [stats, setStats] = useState({});
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


    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                var spotifyStats = JSON.parse(sessionStorage.getItem('spotifyStats'));
                const access_token = await checkTokenExpiry();
                if (!spotifyStats) {
                    const response = await axios.get('http://localhost:5000/stats', {
                        headers: {
                            Authorization: `Bearer ${access_token}`,
                            Artists: JSON.stringify(JSON.parse(sessionStorage.getItem('artistData')).data)
                        }
                    });
                    sessionStorage.setItem('spotifyStats', JSON.stringify(response.data));
                    spotifyStats = response.data;
                }
                const topTracks = spotifyStats?.topTracks
                var trackInfo = topTracks.map( function(track) {
                        var trackYear = parseInt(track.album.release_date.substring(0, 4));
                        var info = { "name": track.name,
                                     "year": trackYear
                                    }
                        return info;
                   });
                console.log("track info:", trackInfo);
                if (topTracks) {
                    const response = await axios.post('http://localhost:5000/get-prediction', { track_info: trackInfo });
                    console.log(response.data)
                    const recommended_tracks = response.data;

                    
                    console.log("yo:",recommended_tracks.prediction.map(track => track.id).join(','));
                    const ids_param = recommended_tracks.prediction.map(track => track.id).join(',')
                    const res = await axios.get('http://localhost:5000/tracks', {
                        headers: {
                            Authorization: `Bearer ${access_token}`,
                            ids: ids_param
                        }
                    });
                    console.log("tracks:", res.data);
                    setRecommendedTracks(res.data || []);                  
                }
                setLoading(false);
            } catch (error) {
                setError('Error fetching recommendations');
                console.error('Error fetching recommendations:', error);
                setLoading(false)
            }
        };

        fetchRecommendations();
    }, []);

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
                    <Navbar.Brand href="/">Music Recommender</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                            <LinkContainer to="/home">
                                <Nav.Link>Home</Nav.Link>
                            </LinkContainer>
                            <LinkContainer to="/stats">
                                <Nav.Link>Stats</Nav.Link>    
                            </LinkContainer>
                            <LinkContainer to="/explore">
                                <Nav.Link>Explore</Nav.Link>    
                            </LinkContainer>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
            <Container className="mt-5">
                <h2 id='title'>Explore Different Genres</h2>
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

}

export default Explore;