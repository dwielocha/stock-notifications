import db from '@/src/shared/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { ulid } from 'ulid';

export interface Notification extends RowDataPacket {
    id: string;
    created_at: string;
    email: string;
    event_type: EventType;
    related_id: string;
}

export enum EventType {
    BACK_IN_STOCK = 'BACK_IN_STOCK',
}

class NotificationRepository {
    async create(
        email: string,
        eventType: EventType,
        relatedId: string,
    ): Promise<Notification> {
        const id = ulid();

        await db.query<ResultSetHeader>(
            'INSERT INTO `notifications` (`id`, `email`, `product_sku`, `created_at`) VALUES (?, ?, ?, NOW())',
            [id, email, eventType, relatedId],
        );

        const [rows] = await db.query<Notification[]>(
            'SELECT * FROM `notifications` WHERE `id` = ?',
            [id],
        );

        return rows[0];
    }

    async findExisting(
        email: string,
        eventType: EventType,
        relatedId: string,
    ): Promise<Notification> {
        const [rows] = await db.execute<Notification[]>(
            'SELECT * FROM `notifications` WHERE `email` = ? AND `event_type` = ? AND `related_id` = ?',
            [email, eventType, relatedId],
        );

        return rows[0];
    }

    async findNotSentByEventTypeAndRelatedId(
        eventType: EventType,
        relatedId: string,
    ): Promise<Notification[]> {
        const [rows] = await db.execute<Notification[]>(
            'SELECT * FROM `notifications` WHERE `event_type` = ? AND `related_id` = ? AND sent_at IS NULL',
            [eventType, relatedId],
        );

        return rows;
    }
}

export default new NotificationRepository();
