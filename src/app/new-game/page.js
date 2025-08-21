'use client'

import { useRouter } from "next/navigation"
import styles from "./newgame.module.css"
import { useEffect, useState } from "react"
import { jwtDecode } from "jwt-decode"

const NewGame = () => {
    const router = useRouter()
    const [fadeClass, setFadeClass] = useState('fade-wrapper')
    const [username, setUsername] = useState("")
    const [gamename, setGameName] = useState("")
    const [gm, setGM] = useState("Solo")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const getToken = () => {
        const token = localStorage.getItem("ttrek_token")
        if (token) {
            const decoded = jwtDecode(token)
            setUsername(decoded.username)
        } else {
            router.push("/")
        }
    }

    useEffect(() => {
        getToken()
    }, [])

    const handleRedirect = (path) => {
        setFadeClass('fade-wrapper fade-out')
        setTimeout(() => {
            router.push(`/${path}`)
        }, 500);
    };

    useEffect(() => {
        if (username.trim() !== "") {
            setFadeClass('fade-wrapper fade-in')
        }
    }, [username])

    const handleCreateGame = async () => {
        setLoading(true)
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BURL}/create-game`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ username, gameName: gamename, gameMode: gm })
            })
            const data = await response.json()
            if (data.error === "Game Name already exists.") {
                setError("Game Name already exists.")
                setTimeout(() => {
                    setError("")
                }, 3000)
            }
            if (data.success) {
                handleRedirect(`game/${data.gid}`)
            }
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const handleGMBtn = (text) => {
        setGM(text)
    }

    return (
        <div className={styles.page}>
            <div className={styles.navbar}>
                <div className={styles.logo}>
                    <h1 onClick={() => { handleRedirect('') }}>Treasure Trek</h1>
                </div>
                <div className={`${styles.navlinks} ${styles[fadeClass.split(' ')[0]]} ${styles[fadeClass.split(' ')[1]]}`}>
                    <a onClick={() => { handleRedirect('my-games') }}>My Games</a>
                    <a onClick={() => { handleRedirect('account') }}>{username}</a>
                </div>
            </div>

            <div className={`${styles.container} ${styles[fadeClass.split(' ')[0]]} ${styles[fadeClass.split(' ')[1]]}`}>
                <h1 className={styles.heading}>New Game</h1>
                <p className={styles.label}>Game Name:</p>
                <input className={styles.input} type="text" placeholder="eg: treasure-hunt-001" value={gamename} onChange={(e) => { setGameName(e.target.value) }} />
                {error.trim() !== "" ? (
                    <p style={{ fontFamily: "Lexend", fontWeight: 320, fontSize: "0.8rem", marginBottom: 11, marginTop: 5, color: "#2b2b2b", marginLeft: 10 }}>{error}</p>
                ) : (
                    <p>{error}</p>
                )}
                <p className={styles.label}>Game Mode:</p>
                <div className={styles.buttonContainer}>
                    {/* <button className={styles.gmBtn} style={{ backgroundColor: gm === "Team" ? "#203430" : "#203430cc" }} onClick={() => { handleGMBtn("Team") }}>Team vs Team</button> */}
                    <button className={styles.gmBtn} style={{ backgroundColor: gm === "Solo" ? "#203430" : "#203430cc" }} onClick={() => { handleGMBtn("Solo") }}>Solo vs Solo</button>
                </div>

                <button className={styles.cgbtn} disabled={gm.trim() === "" || gamename.trim() === "" || loading} onClick={handleCreateGame}>Create Game</button>
            </div>
        </div>
    )
}

export default NewGame;