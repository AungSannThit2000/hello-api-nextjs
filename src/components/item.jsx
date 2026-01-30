import { useEffect, useState } from 'react';
function Item() {
    const [items, setItems] = useState([])
    const [isLoading, setLoading] = useState(true)
    async function fetchitems() {
        const endpoint = "http://localhost:3000/api/item"
        const result = await fetch(endpoint)
        if (result.ok) {
            const data = await result.json()
            setItems(data)
            setLoading(false)
        }
    }
    useEffect(() => {
        fetchitems();
    }, [])
    if (isLoading) return (<h1>Loading ...</h1>)
    return (
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                </tr>
            </thead>
            <tbody>
                {
                    items.map((item, index) => (
                        <tr key={index}>
                            <td>{item._id}</td>
                            <td>{item.itemName}</td>
                            <td>{item.itemPrice}</td>
                        </tr>
                    ))
                }
            </tbody>
        </table>
    )
}
export default Item;