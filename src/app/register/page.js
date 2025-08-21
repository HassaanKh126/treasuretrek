'use client'

import React, { useEffect, useState } from "react"
import styles from "./register.module.css"
import { useRouter } from "next/navigation"

const Register = () => {
    const router = useRouter()
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [fadeClass, setFadeClass] = useState('fade-wrapper')

    useEffect(() => {
        setFadeClass('fade-wrapper fade-in')
    }, [])

    const handleRedirect = (path) => {
        setFadeClass('fade-wrapper fade-out')
        setTimeout(() => {
            router.push(`/${path}`)
        }, 500);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (username.trim() === "" || email.trim() === "" || password.trim() === "") {
            alert("All fields are required.");
            return;
        }

        setLoading(true)
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BURL}/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, email, password })
            })
            const data = await response.json();
            if (data.message === "User registered successfully") {
                handleRedirect("login")
            } else {
                if (data.error === "All fields are required") {
                    alert("All fields are required.")
                }
                if (data.error === "Email already exists") {
                    alert("Email already exists.")
                }
                if (data.error === "Username already exists") {
                    alert("Username already exists.")
                }
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={`${styles.page} ${styles[fadeClass.split(' ')[0]]} ${styles[fadeClass.split(' ')[1]]}`}>
            <div className={styles.container}>
                <h1 className={styles.heading}>Treasure Trek</h1>
                <h1 className={styles.subheading}>Register</h1>
                <form className={styles.registerForm} onSubmit={handleSubmit}>
                    <input type="text" placeholder="Username..." value={username} onChange={(e) => { setUsername(e.target.value) }} />
                    <input type="email" placeholder="Email..." value={email} onChange={(e) => { setEmail(e.target.value) }} />
                    <input type="password" placeholder="Password..." value={password} onChange={(e) => { setPassword(e.target.value) }} />
                    <button type="submit" disabled={loading}>Register</button>
                </form>
                <p className={styles.bottomText} onClick={() => { handleRedirect("login") }}>Already have an account? Login.</p>
            </div>
        </div>
    )
}

export default Register;