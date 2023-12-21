import { ResultSetHeader, RowDataPacket } from 'mysql2';
import connection from '../utils/db';
import { ulid } from 'ulid';

export interface Subscription extends RowDataPacket {
    id: string;
    email: string;
    product_sku: string;
    created_at: string;
}

class SubscriptionRepository {
    async create(email: string, productSku: string): Promise<Subscription> {
        const id = ulid();

        await connection.query<ResultSetHeader>(
            'INSERT INTO `subscriptions` (`id`, `email`, `product_sku`, `created_at`) VALUES (?, ?, ?, NOW())',
            [id, email, productSku],
        );

        const [rows] = await connection.query<Subscription[]>(
            'SELECT * FROM `subscriptions` WHERE `id` = ?',
            [id],
        );

        return rows[0];
    }

    async delete(id: string): Promise<number> {
        const [result] = await connection.query<ResultSetHeader>(
            'DELETE FROM `subscriptions` WHERE `id` = ?',
            [id],
        );

        return result.affectedRows;
    }

    async findByEmailAndProductSku(
        email: string,
        productSku: string,
    ): Promise<Subscription> {
        const [rows] = await connection.execute<Subscription[]>(
            'SELECT * FROM `subscriptions` WHERE `email` = ? AND `product_sku` = ?',
            [email, productSku],
        );

        return rows[0];
    }

    async findByProductSku(productSku: string): Promise<Subscription[]> {
        const [rows] = await connection.execute<Subscription[]>(
            'SELECT * FROM `subscriptions` WHERE `product_sku` = ?',
            [productSku],
        );

        return rows;
    }
}

export default new SubscriptionRepository();
