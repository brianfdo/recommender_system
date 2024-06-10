// src/components/Home.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Navbar, Nav, ListGroup, Spinner, Button } from 'react-bootstrap';

const Home = () => {
    const [tracks, setTracks] = useState([]);
    const [loading, setLoading] = useState(true);
    const accessToken = new URLSearchParams(window.location.search).get('access_token');

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                if (accessToken) {
                    const response = await axios.get('http://localhost:5000/recommendations', {
                        params: { access_token: accessToken },
                    });
                    setTracks(response.data);
                }
            } catch (error) {
                console.error('Error fetching recommendations:', error.response ? error.response.data : error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendations();
    }, [accessToken]);

    return (
<div>
            <Navbar bg="dark" variant="dark" expand="lg">
                <Navbar.Brand href="#">Spotify Recommender</Navbar.Brand>
                <Nav className="mr-auto">
                    <Nav.Link href="#">Home</Nav.Link>
                </Nav>
            </Navbar>
            <Container className="mt-4">
                <h1>Recommended Tracks</h1>
                {loading ? (
                    <Spinner animation="border" role="status">
                        {/* <span className="sr-only">Loading...</span> */}
                    </Spinner>
                ) : (
                    <ListGroup>
                        {tracks.map((track, index) => (
                            <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h5>{track.name}</h5>
                                    <p>{track.artists.map(artist => artist.name).join(', ')}</p>
                                </div>
                                <div>
                                    <Button variant="primary" className="mr-2">
                                        Play
                                    </Button>
                                    <Button variant="outline-danger">Like</Button>
                                </div>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                )}
            </Container>
        </div>
    );
};

export default Home;
