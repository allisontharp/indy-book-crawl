interface MapProps {
    bookstores: Array<{
        id: string
        name: string
        latitude: number
        longitude: number
    }>
}

const Map = ({ bookstores }: MapProps) => {
    return (
        <div className="w-full h-[600px] bg-gray-100 rounded-lg shadow-md">
            <div className="w-full h-full flex items-center justify-center">
                <p className="text-gray-500">Map will be implemented here</p>
                {/* We'll implement the actual map functionality later using a mapping library like Mapbox or Google Maps */}
            </div>
        </div>
    )
}

export default Map 