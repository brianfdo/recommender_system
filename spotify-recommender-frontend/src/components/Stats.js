import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Spinner, Alert, Nav, Navbar } from 'react-bootstrap';
import Plot from 'react-plotly.js';
import { LinkContainer } from 'react-router-bootstrap';

const Stats = () => {
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchStats = async () => {
        try {
            const accessToken = sessionStorage.getItem('spotifyAccessToken');

            // Check if stats are already cached in localStorage
            const cachedStats = sessionStorage.getItem('spotifyStats');
            if (cachedStats) {
                setStats(JSON.parse(cachedStats));
                setLoading(false);
                return;
            }

            const response = await axios.get('http://localhost:5000/stats', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    Artists: JSON.stringify(JSON.parse(sessionStorage.getItem('artistData')).data)
                }
            });

            setStats(response.data);
            sessionStorage.setItem('spotifyStats', JSON.stringify(response.data)); // Cache the stats
            setLoading(false);
        } catch (err) {
            console.error('Error fetching stats:', err);
            setError('Error fetching stats');
            setLoading(false);
        }
    };

    useEffect(() => {
            fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="spinner-container">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </div>
        );
    }

    if (error) {
        return (
            <div className="spinner-container">
                <Alert variant="danger">{error}</Alert>
            </div>
        );
    }

    const audioFeatures = stats.audioFeatures || [];

    const danceability = audioFeatures.map(feature => feature.danceability);
    const energy = audioFeatures.map(feature => feature.energy);
    const valence = audioFeatures.map(feature => feature.valence);
    const labels = audioFeatures.map((_, index) => `Track ${index + 1}`);

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
            <h2 id='title'>User Music Stats</h2>
            <Row>
                <Col>
                    <Card className="mb-4">
                        <Card.Body>
                            <Card.Title>Top Tracks Audio Features</Card.Title>
                            <Plot
                                data={[
                                    {
                                        x: labels,
                                        y: danceability,
                                        type: 'bar',
                                        name: 'Danceability',
                                        marker: { color: 'rgba(75, 192, 192, 0.6)' },
                                    },
                                    {
                                        x: labels,
                                        y: energy,
                                        type: 'bar',
                                        name: 'Energy',
                                        marker: { color: 'rgba(54, 162, 235, 0.6)' },
                                    },
                                    {
                                        x: labels,
                                        y: valence,
                                        type: 'bar',
                                        name: 'Valence',
                                        marker: { color: 'rgba(255, 206, 86, 0.6)' },
                                    },
                                ]}
                                layout={{
                                    barmode: 'stack',
                                    title: 'Audio Features of Top Tracks',
                                    xaxis: { title: 'Tracks' },
                                    yaxis: { title: 'Values' },
                                }}
                            />
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Card className="mb-4">
                        <Card.Body>
                            <Card.Title>Top Artists</Card.Title>
                            <Card.Text>
                                {stats.topArtists && stats.topArtists.map(artist => (
                                    <div key={artist.id} className='artistItem'>
                                        <img 
                                            src={artist.images[0].url} 
                                            alt={artist.name} 
                                            className="artist-img" 
                                        />
                                        {artist.name}
                                    </div>
                                ))}
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col>
                    <Card className="mb-4">
                        <Card.Body>
                            <Card.Title>Top Tracks</Card.Title>
                            <Card.Text>
                                {stats.topTracks && stats.topTracks.map(track => (
                                    <div key={track.id}>{track.name}</div>
                                ))}
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Card className="mb-4">
                        <Card.Body>
                            <Card.Title>Top Genres</Card.Title>
                            <Card.Text>
                                {stats.topGenres && stats.topGenres.map((genre, index) => (
                                    <div key={index}>{genre}</div>
                                ))}
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
        </>
        
    );
};

export default Stats;
