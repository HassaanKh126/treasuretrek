'use client'

import { jwtDecode } from "jwt-decode"
import styles from "./account.module.css"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

const MyGame = () => {
    const router = useRouter()
    const [fadeClass, setFadeClass] = useState('fade-wrapper')
    const [username, setUsername] = useState("")
    const [data, setData] = useState()

    const getToken = () => {
        const token = localStorage.getItem("ttrek_token")
        if (token) {
            const decoded = jwtDecode(token)
            setUsername(decoded.username)
        }
    }

    useEffect(() => {
        getToken()
    }, [])

    useEffect(() => {
        if (username) {
            getMyGames()
        }
    }, [username])

    const getMyGames = async () => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BURL}/get-user-info`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username })
        })
        const data = await response.json()
        setData(data)
    }

    useEffect(() => {
        if (data) {
            setFadeClass('fade-wrapper fade-in')
        }
    }, [data])

    const handleRedirect = (path) => {
        setFadeClass('fade-wrapper fade-out')
        setTimeout(() => {
            if (path === "account") {
                window.location.href = "/account"
            } else {
                router.push(`/${path}`)
            }
        }, 500);
    };

    const handleLogout = () => {
        localStorage.removeItem('ttrek_token')
        handleRedirect("")
    }

    return (
        <div className={styles.page}>
            <div className={styles.navbar}>
                <div className={styles.logo}>
                    <h1 onClick={() => { handleRedirect('') }}>Treasure Trek</h1>
                </div>
                <div className={`${styles.navlinks} ${styles[fadeClass.split(' ')[0]]} ${styles[fadeClass.split(' ')[1]]}`}>
                    {username ? (
                        <>
                            <a onClick={() => { handleRedirect('my-games') }}>My Games</a>
                            <a onClick={() => { handleRedirect('account') }}>{username}</a>
                        </>
                    ) : (
                        <>
                            <a onClick={() => { handleRedirect("login") }}>Login</a>
                        </>
                    )}
                </div>
            </div>

            <div className={`${styles.container} ${styles[fadeClass.split(' ')[0]]} ${styles[fadeClass.split(' ')[1]]}`}>
                <h1 className={styles.welcomeMessage} style={{ margin: 0 }}>{username}</h1>
                {data && (
                    <>
                        <h2>Total Games Participated: {data.participatedGames || 0}</h2>
                        <h2>Total Games Hosted: {data.hostedGames || 0}</h2>
                        <h2>Total Games Won: {data.winCount || 0}</h2>
                        <button onClick={handleLogout}>Logout</button>
                    </>
                )}
            </div>
        </div>
    )
}

export default MyGame;