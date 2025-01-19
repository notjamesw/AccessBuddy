import React from 'react';

const Homepage = ({ navigate }) => {
    return (
        <div>
            <h1>Homepage</h1>
            <button onClick={() => navigate('info')}>Go to Info</button>
        </div>
    );
}

export default Homepage;