'use client'

import { useEffect, useState } from "react";
import styles from "./login.module.css"
import { useRouter } from "next/navigation";

const Login = () => {
    const router = useRouter()
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
        e.preventDefault()
        if (email.trim() === "" || password.trim() === "") {
            alert('Email and Password are required.')
            return
        }
        setLoading(true)
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BURL}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json()

            if (data.token) {
                localStorage.setItem("ttrek_token", data.token)
                handleRedirect("app")
            } else {
                if (data.error === "Invalid email or password") {
                    alert("Invalid Email or Password.")
                }
                if (data.error === "Email and password are required") {
                    alert("Email and password are required.")
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
                <h1 className={styles.subheading}>Login</h1>
                <form className={styles.loginForm} onSubmit={handleSubmit}>
                    <input type="email" placeholder="Email..." value={email} onChange={(e) => { setEmail(e.target.value) }} />
                    <input type="password" placeholder="Password..." value={password} onChange={(e) => { setPassword(e.target.value) }} />
                    <button type="submit" disabled={loading}>Login</button>
                </form>
                <p className={styles.bottomText} onClick={() => { handleRedirect("register") }}>{`Don't have an account? Sign Up.`}</p>
            </div>
        </div >
    )
}

export default Login;