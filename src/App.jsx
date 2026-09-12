import { useState } from "react";
import "./App.css";

function App() {

    const [handle, setHandle] = useState("");
    const [channel, setChannel] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

    const searchChannel = async () => {

        setError("");
        setChannel(null);

        if (!handle.trim()) {
            setError("Please enter a YouTube Channel.");
            return;
        }

        if (!API_KEY) {
            setError("YouTube API key is missing.");
            return;
        }

        setLoading(true);

        try {

            // Remove spaces
            let cleanHandle = handle.trim();

            // Add @ if user didn't enter it
            if (!cleanHandle.startsWith("@")) {
                cleanHandle = "@" + cleanHandle;
            }

            const url =
                `https://www.googleapis.com/youtube/v3/channels` +
                `?part=snippet,statistics` +
                `&forHandle=${encodeURIComponent(cleanHandle)}` +
                `&key=${API_KEY}`;

            const response = await fetch(url);

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error?.message || "YouTube API request failed."
                );
            }

            if (!data.items || data.items.length === 0) {
                setError("Channel not found.");
                return;
            }

            const channelData = data.items[0];

            setChannel({
                id: channelData.id,

                name: channelData.snippet.title,

                description: channelData.snippet.description,

                image:
                    channelData.snippet.thumbnails?.high?.url ||
                    channelData.snippet.thumbnails?.default?.url,

                subscribers:
                    channelData.statistics.subscriberCount,

                views:
                    channelData.statistics.viewCount,

                videos:
                    channelData.statistics.videoCount,

                hiddenSubscribers:
                    channelData.statistics.hiddenSubscriberCount
            });

        } catch (error) {

            console.error(error);

            setError(error.message);

        } finally {

            setLoading(false);

        }
    };


    const formatNumber = (number) => {

        if (!number) {
            return "0";
        }

        return new Intl.NumberFormat("en-US").format(
            Number(number)
        );
    };


    return (

        <div className="app">

            <h1>YouTube Channel Finder</h1>

            <div className="search-box">

                <input
                    type="text"
                    placeholder="@GoogleDevelopers"
                    value={handle}
                    onChange={(event) =>
                        setHandle(event.target.value)
                    }
                    onKeyDown={(event) => {

                        if (event.key === "Enter") {
                            searchChannel();
                        }

                    }}
                />

                <button
                    onClick={searchChannel}
                    disabled={loading}
                >

                    {loading ? "Searching..." : "Search"}

                </button>

            </div>


            {error && (

                <div className="error">
                    {error}
                </div>

            )}


            {channel && (

                <div className="channel-card">

                    <img
                        src={channel.image}
                        alt={channel.name}
                        className="channel-image"
                    />

                    <div className="channel-info">

                        <h2>
                            {channel.name}
                        </h2>

                        {/* <p>
                            <strong>Channel ID:</strong>{" "}
                            {channel.id}
                        </p> */}

                        <p>
                            <strong>Subscribers:</strong>{" "}

                            {channel.hiddenSubscribers
                                ? "Hidden"
                                : formatNumber(
                                    channel.subscribers
                                )}
                        </p>

                        <p>
                            <strong>Total Views:</strong>{" "}
                            {formatNumber(channel.views)}
                        </p>

                        <p>
                            <strong>Total Videos:</strong>{" "}
                            {formatNumber(channel.videos)}
                        </p>
{/* 
                        <p className="description">
                            {channel.description}
                        </p> */}

                    </div>

                </div>

            )}

        </div>

    );
}

export default App;