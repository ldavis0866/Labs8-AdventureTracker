import React, { Component } from 'react';
import { Query } from 'react-apollo';
import styled from 'styled-components';
import ArchiveTrip from './ArchiveTrip';
import { CURRENT_USER_QUERY } from './User';

const Center = styled.div`
  text-align: center;
`;

const TripsList = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 60px;
  max-width: ${props => props.theme.maxWidth};
  margin: 3rem;
`;

class ArchiveTrips extends Component {
  formatDate = date => {
    const newDate = date.match(/(\d{4})-(\d{2})-(\d{2})/);
    return newDate[0];
  };
  render() {
    return (
      <Center>
        {/* added refetchQueries to see if shows new trip when pushed to /triplist */}
        {/* <Query query={CURRENT_USER_QUERY} refetchQueries={[{ query: CURRENT_USER_QUERY }]}> */}
        <Query query={CURRENT_USER_QUERY}>
          {({ data, error, loading }) => {
            if (loading) return <p>Loading...</p>;
            if (error) return <p>Error: {error.message}</p>;
            return (
              <TripsList>
                {data.me !== null
                  ? data.me.trip.map(trip => {
                      if (trip.archived) {
                        return (
                          <ArchiveTrip
                            key={trip.id}
                            id={trip.id}
                            title={trip.title}
                            start={this.formatDate(trip.startDate)}
                            end={this.formatDate(trip.endDate)}
                            archived={trip.archived}
                          />
                        );
                      } else {
                        return null;
                      }
                    })
                  : null}
              </TripsList>
            );
          }}
        </Query>
      </Center>
    );
  }
}

export default ArchiveTrips;
