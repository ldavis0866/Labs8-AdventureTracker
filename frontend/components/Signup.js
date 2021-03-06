import React, { Component, Fragment } from 'react';
import { FacebookProvider, LoginButton } from 'react-facebook';
import { Mutation } from 'react-apollo';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { device } from '../lib/device';
import { fab, faFacebookSquare } from '@fortawesome/free-brands-svg-icons';
import { FacebookIcon } from './styles/SVGs';
import gql from 'graphql-tag';
import uuidv4 from 'uuid/v4';
import Router from 'next/router';
import axios from 'axios';
import {
  Form,
  FormLabel,
  FormHeader,
  FormBox,
  FormGroup,
  FormFieldset,
  FormTitle
} from './styles/FormStyles';
import styled from 'styled-components';
import { PrimaryBtn } from './styles/ButtonStyles';
import { FacebookBtn } from './styles/LinkBtnStyles';
import { PrimaryLinkBtn } from './styles/PrimaryLinkBtn';
import Error from './ErrorMessage';

library.add(faFacebookSquare);

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
`;
const PasswordBox = styled(FormBox)`
  border: 2px solid ${props => (props.passwordMatch ? 'none' : props.theme.red)};
  @media ${device.tablet} {
    font-size: 2.5rem;
  }
`;
const BackBtn = styled(PrimaryBtn)`
  background: grey;
  height: 6.5rem;
  width: 12rem;
  @media ${device.tablet} {
    height: 5rem;
    font-size: 2.5rem;
  }
`;
const NextBtn = styled(PrimaryBtn)`
  margin: 0 0 3rem auto;
  @media ${device.tablet} {
    font-size: 2.4rem;
    margin: 0 0 2rem auto;
  }
`;
const LoginInsteadBtn = styled(PrimaryLinkBtn)`
  width: 100%;
  @media ${device.tablet} {
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }
`;
const SignUpBtn = styled(PrimaryBtn)`
  margin: 0 0 3rem auto;
  @media ${device.tablet} {
    height: 5rem;
    font-size: 2rem;
    margin-bottom: 1.5rem;
  }
`;

const Facebook = styled(LoginButton)`
  display: flex;
  justify-content: center;
  align-items: center;
  height: ${props => (props.height ? props.height : '6rem')};
  width: ${props => (props.width ? props.width : '18rem')};
  border: none;
  border-radius: 10px;
  color: ${props => props.theme.white};
  background: ${props => props.theme.orange};
  cursor: pointer;
  font-size: 3rem;
  margin-bottom: 2rem;
  width: 100%;
  background-color: ${props => props.theme.blue};
  @media ${device.tablet} {
    font-size: 2.3rem;
    margin-bottom: 1.5rem;
  }
`;

const PasswordErrorGroup = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
`;
const PasswordError = styled.p`
  color: ${props => props.theme.red};
  display: ${props => (props.passwordMatch ? 'none' : 'inline')};
  position: relative;
  top: 50%;
  margin: 0;
`;
const SIGNUP_MUTATION = gql`
  mutation SIGNUP_MUTATION(
    $email: String!
    $name: String!
    $facebookUser: Boolean!
    $password: String!
    $password2: String!
    $tripCount: Int!
    $paid: Boolean!
  ) {
    signup(
      email: $email
      name: $name
      facebookUser: $facebookUser
      password: $password
      password2: $password2
      tripCount: $tripCount
      paid: $paid
    ) {
      # returned values
      id
      email
      name
      facebookUser
    }
  }
`;

const CREATE_TRIP_MUTATION = gql`
  mutation CREATE_TRIP_MUTATION(
    $title: String!
    $startDate: String!
    $endDate: String!
    $user: UserWhereUniqueInput!
    $archived: Boolean! # $markers: [Marker!]!
  ) {
    createTrip(
      title: $title
      user: $user
      startDate: $startDate
      endDate: $endDate
      archived: $archived
    ) {
      id
    }
  }
`;

class Signup extends Component {
  state = {
    name: '',
    email: '',
    password: '',
    password2: '',
    facebookUser: false,
    passwordMatch: true,
    tripCount: 0,
    paid: false,
    step: 1
  };

  updateState = e => {
    this.setState({ [e.target.name]: e.target.value }, this.passwordMatch);
  };

  prevStep = () => {
    this.setState({ step: --this.state.step });
  };
  nextStep = () => {
    this.setState({ step: ++this.state.step });
  };
  passwordMatch = () => {
    const { password, password2 } = this.state;
    //Checks if they both have text and if they match or not
    if (password && password2 && password !== password2) {
      this.setState({ passwordMatch: false });
    } else if (password === password2) {
      this.setState({ passwordMatch: true });
    }
  };

  // facebook handlers
  handleResponse = data => {
    // console.log(data.profile);
    localStorage.setItem('id', data.profile.id);
    localStorage.setItem('name', data.profile.first_name);
    localStorage.setItem('email', data.profile.email);
    localStorage.setItem('signup', true);
    Router.push({
      pathname: '/facebooksignup'
    });
  };
  handleError = error => {
    this.setState({ error });
  };

  render() {
    const { step, passwordMatch } = this.state;
    return (
      // using the SIGNUP_MUTATION sending the state
      <Mutation mutation={SIGNUP_MUTATION} variables={this.state}>
        {/* desctucturing error and loading so we can use them if needed */}
        {(signup, { error, loading }) => {
          return (
            <Form
              method="post"
              onSubmit={async e => {
                e.preventDefault();
                await signup();
                this.setState({ name: '', email: '', password: '', password2: '', step: 1 });

                Router.push({
                  pathname: '/triplist'
                });
              }}
            >
              <FormHeader>Adventure Tracker</FormHeader>
              {/* updates the bar with loading status */}
              <FormFieldset disabled={loading} aria-busy={loading}>
                <FormTitle>Sign-Up</FormTitle>
                {/* TODO Clean up error messages */}
                <Error error={error} />
                {/* Using IIFEs for transitioning to the next Sign-up Step and back to previous step*/}
                {(() => {
                  switch (step) {
                    case 1:
                      return (
                        <Fragment>
                          <FormGroup>
                            <FormLabel htmlFor="name" width={'10rem'}>
                              Name
                            </FormLabel>
                            <FormBox
                              type="text"
                              name="name"
                              id="name"
                              placeholder="Enter Name"
                              value={this.state.name}
                              onChange={this.updateState}
                            />
                          </FormGroup>
                          <FormGroup>
                            <FormLabel htmlFor="email" width={'10rem'}>
                              Email
                            </FormLabel>
                            <FormBox
                              type="email"
                              name="email"
                              id="email"
                              placeholder="Enter Email"
                              value={this.state.email}
                              onChange={this.updateState}
                            />
                          </FormGroup>
                        </Fragment>
                      );
                    case 2:
                      return (
                        <Fragment>
                          <FormGroup>
                            <FormLabel htmlFor="password" width={'10rem'}>
                              Password
                            </FormLabel>
                            <PasswordBox
                              type="password"
                              name="password"
                              id="password"
                              placeholder="Enter Password"
                              value={this.state.password}
                              onChange={this.updateState}
                              passwordMatch={passwordMatch}
                            />
                          </FormGroup>
                          <FormGroup>
                            <PasswordErrorGroup>
                              <FormLabel htmlFor="password2" width={'15rem'}>
                                Password Again
                              </FormLabel>
                              <PasswordError passwordMatch={passwordMatch}>
                                Passwords don't match
                              </PasswordError>
                            </PasswordErrorGroup>
                            <PasswordBox
                              type="password"
                              name="password2"
                              id="password2"
                              placeholder="Re-Enter Password"
                              value={this.state.password2}
                              onChange={this.updateState}
                              passwordMatch={passwordMatch}
                            />
                          </FormGroup>
                        </Fragment>
                      );
                  }
                })()}

                {(() => {
                  switch (step) {
                    case 1:
                      return <NextBtn onClick={this.nextStep}>Next</NextBtn>;
                    case 2:
                      return (
                        <ButtonGroup>
                          <BackBtn onClick={this.prevStep}>Back</BackBtn>
                          <SignUpBtn type="submit">Sign Up!</SignUpBtn>
                        </ButtonGroup>
                      );
                  }
                })()}
                <FacebookProvider appId="2047335438690331">
                  <Facebook
                    scope="email"
                    onCompleted={this.handleResponse}
                    onError={this.handleError}
                  >
                    <FacebookIcon length={40} />
                    &nbsp; Facebook Signup
                  </Facebook>
                </FacebookProvider>
                <LoginInsteadBtn href="/login">Login instead?</LoginInsteadBtn>
              </FormFieldset>
            </Form>
          );
        }}
      </Mutation>
    );
  }
}

export default Signup;
