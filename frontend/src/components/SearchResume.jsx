import { useState } from "react";

export  function SearchResume({extractedData}) {
    const [query, setQuery] = useState(`${extractedData}`);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSearch = async () => {
        if (!query) return;
        setLoading(true);
        setError(null);
        console.log(query);
        try {
            const response = await fetch("http://localhost:5001/search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query })
            });
            
            if (!response.ok) {
                throw new Error("Failed to fetch results");
            }
            
            const data = await response.json();
            setResults(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4">
            
            <button 
                onClick={handleSearch} 
                className="mt-2 p-2 bg-blue-500 text-white rounded"
                disabled={loading}
            >
                {loading ? "Searching..." : "Search"}
            </button>
            {error && <p className="text-red-500 mt-2">{error}</p>}
            <ul className="mt-4">
                {results.map((result, index) => (
                    <li key={index} className="border p-2 my-2">
                        <p>{JSON.stringify(result.id, null, 2)}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
}
