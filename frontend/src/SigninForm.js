import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import './SigninForm.css'
import {useNotification} from './Notifications/useNotification';
import CustomersService from './RecommendationsService';

const customersService = new CustomersService();

function SigninForm() {
    const [usernameOrEmail, setUsernameOrEmail] = useState('');
    const [password, setPassword] = useState('');
    const [usernameOrEmailErr, setUsernameOrEmailErr] = useState('');
    const [passwordErr, setPasswordErr] = useState('');
    const navigate = useNavigate();
    const {createNotification} = useNotification();

    function handleSubmit(event) {
        event.preventDefault();
        if (signinFormValidation()) {
            let signinFormRequest = {"password": password};
            let usernameValidRegex = /^[a-zA-Z0-9._-]+$/;
            if (usernameOrEmail.match(usernameValidRegex)) {
                signinFormRequest["username"] = usernameOrEmail;
            }
            else {
                signinFormRequest["email"] = usernameOrEmail;
            }
            customersService.login(signinFormRequest
                ).then((result)=>{
                    localStorage.setItem("isAuthenticated", "true");
                    navigate("/home");
                }).catch((error)=>{
                    createNotification(JSON.stringify(error), "error");
                }
            )
        }
    }

    function signinFormValidation() {
        let usernameOrEmailCheck = usernameOrEmailValidation(); 
        let passwordCheck = passwordValidation();
        return usernameOrEmailCheck && passwordCheck;
    }

    function usernameOrEmailValidation() {
        let validationPass = true;
        let usernameOrEmailElem = document.getElementById('inputUsernameOrEmail');
        if (usernameOrEmailElem.length < 4) {
            setUsernameOrEmailErr("Enter correct username or email");
            usernameOrEmailElem.classList.add('is-invalid');
            validationPass = false;
        }
        else {
            setUsernameOrEmailErr("");
            usernameOrEmailElem.classList.remove('is-invalid');
        }
        return validationPass;
    }

    function passwordValidation() {
        let validationPass = true;
        let passwordElem = document.getElementById('inputPassword');
        if (password.length < 8) {
            setPasswordErr('Enter correct password');
            passwordElem.classList.add('is-invalid');
            validationPass = false;
        }
        else {
            setPasswordErr('');
            passwordElem.classList.remove('is-invalid');
        }
        return validationPass;
    }
    
    return (
        <form onSubmit={handleSubmit} className="d-flex flex-column ghrec-signin-form p-4 ms-5">
        <div className="d-flex justify-content-between ghrec-auth-nav">
            <small>
                <Link to="/auth/register" className="link-dark">Create an account</Link>
            </small>
            <small>
                <Link to="/auth/password/reset" className="link-dark">Forgot password</Link>
            </small>
        </div>
        <div className="signin-form-title">
            <h1>Sign in</h1>
        </div>
        <div className="form-floating mb-2 mt-2">
            <input type="text" className="form-control" id="inputUsernameOrEmail" placeholder="Username or email" onChange={event => setUsernameOrEmail(event.target.value)}/>
            <label htmlFor="inputUsernameOrEmail">Username or email</label>
            <small id="usernameOrEmailHelp" className="text-danger">{usernameOrEmailErr}</small>
        </div>

        <div className="form-floating mb-2 mt-2">
            <input type="password" className="form-control" id="inputPassword" placeholder="Password" onChange={event => setPassword(event.target.value)}/>
            <label htmlFor="inputPassword">Password</label>
            <small id="passwordHelp" className="text-danger">{passwordErr}</small>
        </div>

        <div className="d-grid">
            <input className="ghrec-signup-btn btn btn-primary btn-dark btn-lg mt-4" type="submit" value="Log in"/>
        </div>
        </form>
    );  
}

export default SigninForm;