'use client'

import { jwtDecode } from "jwt-decode"
import styles from "./mygame.module.css"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

const MyGame = () => {
    const router = useRouter()
    const [fadeClass, setFadeClass] = useState('fade-wrapper')
    const [username, setUsername] = useState("")
    const [hostedGames, setHostedGames] = useState()
    const [participatedGames, setParticipatedGames] = useState()

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
        const response = await fetch(`${process.env.NEXT_PUBLIC_BURL}/get-my-games`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username })
        })
        const data = await response.json()
        setHostedGames(data.hostedGames)
        setParticipatedGames(data.participatedGames)
    }

    useEffect(() => {
        if (username.trim() !== "") {
            setFadeClass('fade-wrapper fade-in')
        }
    }, [username])

    const handleRedirect = (path) => {
        setFadeClass('fade-wrapper fade-out')
        setTimeout(() => {
            if (path === "my-games") {
                window.location.href = "/my-games"
            } else {
                router.push(`/${path}`)
            }
        }, 500);
    };

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
                <h1 className={styles.welcomeMessage} style={{ margin: 0 }}>My Games</h1>
                {hostedGames && hostedGames.length > 0 && (
                    <div>
                        <h2 className={styles.myGameSubText}>Hosted:</h2>
                        {hostedGames.map((game, index) => {
                            return (
                                <div className={styles.gameContainer} key={index} onClick={() => { handleRedirect(`game/${game._id}`) }}>
                                    <h1>{game.gameName}</h1>
                                    <h2>Game Mode: {game.gameMode}</h2>
                                    <h2>Total Objects: {game.gameObjects.length}</h2>
                                    <h2>Total Participants: {game.participants.length}</h2>
                                </div>
                            )
                        })}
                    </div>
                )}
                {participatedGames && participatedGames.length > 0 && (
                    <div>
                        <h2 className={styles.myGameSubText}>Participated:</h2>
                        {participatedGames.map((game, index) => {
                            return (
                                <div className={styles.gameContainer} key={index} onClick={() => { handleRedirect(`game/${game._id}`) }}>
                                    <h1>{game.gameName}</h1>
                                    <h2>Game Mode: {game.gameMode}</h2>
                                    <h2>Total Objects: {game.gameObjects.length}</h2>
                                    <h2>Total Participants: {game.participants.length}</h2>
                                    <h2>Your Position: {game.participants.sort((a, b) => b.ppoints - a.ppoints).findIndex(p => p.pname === username) + 1}</h2>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}

export default MyGame;