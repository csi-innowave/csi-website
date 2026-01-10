import eventData from "@/data/eventData";
import Image from "next/image";

export default async function EventPhoto({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const event = eventData.find((event) => event.id.toString() === id);

    if (!event) {
        return <div>Event not found</div>;
    }

    const { eventPhotos } = event;

    return (
        <div className="p-5">
            <h1 className="text-center text-4xl md:text-5xl font-bold mb-8">
                {event.title}
            </h1>
            <div className="grid grid-cols-1 lg:px-16 md:grid-cols-3 gap-4">
                {eventPhotos && eventPhotos.length > 0 ? (
                    eventPhotos.map((photo, index) => (
                        <div key={index} className="relative w-full h-64">
                            <Image
                                src={photo}
                                alt={`Event Photo ${index + 1}`}
                                layout="fill"
                                objectFit="cover"
                                className="rounded"
                            />
                        </div>
                    ))
                ) : (
                    <p>No photos available for this event.</p>
                )}
            </div>
        </div>
    );
}