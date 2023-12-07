import React, { useState, useEffect } from "react";
import config from "../../config";
import FormError from "../layout/FormError";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";

const SignInForm = () => {
  const [userPayload, setUserPayload] = useState({ email: "", password: "" });
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [errors, setErrors] = useState({});
  const [showMessage, setShowMessage] = useState(false);

  const location = useLocation()
  const message = location.state?.message
  
  useEffect(() => {
    if(message) {
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 5000); // Hide the message after 5 seconds
    }
  }, [message]);

  const validateInput = (payload) => {
    let valid = true
    setErrors({});
    const { email, password } = payload;
    const emailRegexp = config.validation.email.regexp;
    let newErrors = {};
    if (!email.match(emailRegexp)) {
      newErrors = {
        ...newErrors,
        email: "is invalid",
      };
      valid = false
    }

    if (password.trim() === "") {
      newErrors = {
        ...newErrors,
        password: "is required",
      };
      valid = false
    }
    setErrors(newErrors);
    return valid
  };

  const onSubmit = async (event) => {
    event.preventDefault()
    try {
      if (validateInput(userPayload)) {
        const response = await fetch("/api/v1/user-sessions", {
          method: "post",
          body: JSON.stringify(userPayload),
          headers: new Headers({
            "Content-Type": "application/json",
          })
        })
        if(!response.ok) {
          const errorMessage = `${response.status} (${response.statusText})`
          const error = new Error(errorMessage)
          throw(error)
        }
        const userData = await response.json()
        setShouldRedirect(true)
      }
    } catch(err) {
      console.error(`Error in fetch: ${err.message}`)
    }
  }

  const onInputChange = (event) => {
    setUserPayload({
      ...userPayload,
      [event.currentTarget.name]: event.currentTarget.value,
    });
  };

  if (shouldRedirect) {
    location.href = "/";
  }

  return (
    <div className="grid-container" onSubmit={onSubmit}>
      <div>
        {message && <p className={`message ${showMessage ? 'show' : ''}`}>{message}</p>}
      </div>
      <h1>Sign In</h1>
      <form>
        <div>
          <label>
            Email
            <input type="text" name="email" value={userPayload.email} onChange={onInputChange} />
            <FormError error={errors.email} />
          </label>
        </div>
        <div>
          <label>
            Password
            <input
              type="password"
              name="password"
              value={userPayload.password}
              onChange={onInputChange}
            />
            <FormError error={errors.password} />
          </label>
        </div>
        <div>
          <input type="submit" className="button" value="Sign In" />
        </div>
        <div className="text-center">
          Don't have an account?
          <Link to="/users/new" className="text-link">
            Sign up!
          </Link>
        </div>
      </form>
    </div>
  );
};

export default SignInForm;