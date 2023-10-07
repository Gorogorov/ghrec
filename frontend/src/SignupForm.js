import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import './SignupForm.css'
import {useNotification} from './Notifications/useNotification';
import CustomersService from './RecommendationsService';

const customersService = new CustomersService();

function SignupForm() {
    const [username, setUsername] = useState('');
    const [githubUsername, setGithubUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [usernameErr, setUsernameErr] = useState('');
    const [githubUsernameErr, setGithubUsernameErr] = useState('');
    const [emailErr, setEmailErr] = useState('');
    const [passwordErr, setPasswordErr] = useState('');
    const [confirmPasswordErr, setConfirmPasswordErr] = useState('');
    const {createNotification} = useNotification();

    function handleSubmit(event) {
        if (signupFormValidation()) {
            customersService.register(
                {
                "username": username,
                "github_username": githubUsername,
                "password": password,
                "email": email
            }
            ).then((result)=>{
                createNotification("You registered successfully!", "success");
            }).catch((error)=>{
                if (error.status === 409) {
                    if (error.message.username) {
                        let usernameElem = document.getElementById('inputUsername');
                        setUsernameErr(error.message.username);
                        usernameElem.classList.add('is-invalid');
                    }
                    if (error.message.email) {
                        let emailElem = document.getElementById('inputEmail');
                        setEmailErr(error.message.email);
                        emailElem.classList.add('is-invalid');
                    }
                }
                else {
                    createNotification(JSON.stringify(error.message), "error");
                }
            });
        }
        event.preventDefault();
    }

    function signupFormValidation() {
        let usernameAndEmailCheck = usernameAndEmailValidation(); 
        let passwordCheck = passwordValidation();
        return usernameAndEmailCheck && passwordCheck;
    }

    function usernameAndEmailValidation() {
        let validationPass = true;
        let usernameElem = document.getElementById('inputUsername');
        let emailElem = document.getElementById('inputEmail');
        let usernameValidRegex = /^[a-zA-Z0-9._-]+$/;
        let emailValidRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

        if (username.length < 4) {
            setUsernameErr("Minimum length is 4");
            usernameElem.classList.add('is-invalid');
            validationPass = false;
        }
        else if (!username.match(usernameValidRegex)) {
            setUsernameErr("Only characters (a-z), (A-Z), (0-9), -, _, . are available");
            usernameElem.classList.add('is-invalid');
            validationPass = false;
        }
        else {
            setUsernameErr("");
            usernameElem.classList.remove('is-invalid');
        }

        if (!email.match(emailValidRegex)) {
            setEmailErr("Enter valid email address");
            emailElem.classList.add('is-invalid');
            validationPass = false;
        }
        else {
            setEmailErr("");
            emailElem.classList.remove('is-invalid');
        }
        return validationPass;
    }

    function passwordValidation() {
        let validationPass = true;
        let passwordElem = document.getElementById('inputPassword');
        let confirmPasswordElem = document.getElementById('inputConfirmPassword');
        if (password.length < 8) {
            setPasswordErr('Minimum length is 8');
            passwordElem.classList.add('is-invalid');
            validationPass = false;
        }
        else {
            setPasswordErr('');
            passwordElem.classList.remove('is-invalid');
        }
        if (password !== confirmPassword) {
            setConfirmPasswordErr('Passwords must be the same');
            confirmPasswordElem.classList.add('is-invalid');
            validationPass = false;
        }
        else {
            setConfirmPasswordErr('');
            confirmPasswordElem.classList.remove('is-invalid');
        }
        return validationPass;
    }
    
    return (
        <form onSubmit={handleSubmit} className="d-flex flex-column ghrec-signup-form p-4 ms-5">
        <div className="login-btn-arrow">
            <Link to="/auth/login">
                <svg width="32" height="14" viewBox="0 0 35 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M34.468 7.59a1.257 1.257 0 00-.875-.34H4.786l4.938-4.938A1.248 1.248 0 009.723.518a1.25 1.25 0 00-1.767.026L1.014 7.487a1.27 1.27 0 00-.289.288L0 8.5l.722.722c.08.112.18.21.292.292l6.942 6.942c.315.325.777.453 1.214.337.437-.112.779-.454.891-.89.116-.438-.012-.9-.337-1.215L4.786 9.75h28.807c.515.007.983-.302 1.178-.78a1.255 1.255 0 00-.303-1.38z" 
                          fill="#000">
                    </path>
                </svg>
            </Link>
        </div>

        <div className="signup-form-title">
            <h1>Sign up</h1>
        </div>
        <div className="form-floating mb-2 mt-2">
            <input type="text" className="form-control" id="inputUsername" placeholder="Username" onChange={event => setUsername(event.target.value)}/>
            <label htmlFor="inputUsername">Username</label>
            <small id="usernameHelp" className="text-danger">{usernameErr}</small>
        </div>

        <div className="form-floating mb-2 mt-2">
            <input type="text" className="form-control" id="inputGithubUsername" placeholder="GithubUsername" onChange={event => setGithubUsername(event.target.value)}/>
            <label htmlFor="inputUsername">Github username</label>
            <small id="githubUsernameHelp" className="text-danger">{githubUsernameErr}</small>
        </div>

        <div className="form-floating mb-2 mt-2">
            <input type="text" className="form-control" id="inputEmail" placeholder="Email" onChange={event => setEmail(event.target.value)}/>
            <label htmlFor="inputEmail">Email</label>
            <small id="EmailHelp" className="text-danger">{emailErr}</small>
        </div>

        <div className="form-floating mb-2 mt-2">
            <input type="password" className="form-control" id="inputPassword" placeholder="Password" onChange={event => setPassword(event.target.value)}/>
            <label htmlFor="inputPassword">Password</label>
            <small id="passwordHelp" className="text-danger">{passwordErr}</small>
        </div>

        <div className="form-floating mb-2 mt-2">
            <input type="password" className="form-control" id="inputConfirmPassword" placeholder="Confirm password" onChange={event => setConfirmPassword(event.target.value)}/>
            <label htmlFor="inputConfirmPassword">Confirm password</label>
            <small id="confirmPasswordHelp" className="text-danger">{confirmPasswordErr}</small>
        </div>
        <div className="d-grid">
            <input className="ghrec-signup-btn btn btn-primary btn-dark btn-lg mt-4" type="submit" value="Create"/>
        </div>
        </form>
    );  
}

export default SignupForm;
