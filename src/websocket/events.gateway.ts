import {
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    ConnectedSocket,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { RoleEnum } from '../enum/role.enum';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private configService = new ConfigService();

    afterInit(server: Server) {
        console.log('WebSocket Gateway Initialized');
    }

    handleConnection(client: Socket, ...args: any[]) {
        try {
            // Get token from headers or query
            const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.split(' ')[1];
            if (!token) {
                console.log(`Client connected without token: ${client.id}`);
                return;
            }

            const secret = this.configService.get<string>('JWT_SECRET');
            if (secret) {
                const decoded: any = jwt.verify(token, secret);
                // Attach decoded user info to socket
                (client as any).user = decoded;

                // Join room based on user role
                if (decoded.role) {
                    client.join(`role_${decoded.role}`);
                    console.log(`Client ${client.id} joined room: role_${decoded.role}`);
                }
            }
        } catch (error) {
            console.log(`Authentication error for client ${client.id}:`, error.message);
        }
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('create_notification')
    handleCreateNotification(@MessageBody() data: { message: string }, @ConnectedSocket() client: Socket): void {
        const user = (client as any).user;

        // Check if user exists and is a DEVELOPER
        if (!user || user.role !== RoleEnum.DEVELOPER) {
            console.log(`Unauthorized notification attempt from ${user?.username || client.id} (Role: ${user?.role})`);

            // Optionally, tell the client they are not authorized
            client.emit('error', { message: 'Only developers can send notifications.' });
            return;
        }

        console.log(`Developer ${user.username} sending notification: ${data.message}`);

        // Emit notification only to ROOT and ADMIN roles
        this.server
            .to(`role_${RoleEnum.ROOT}`)
            .to(`role_${RoleEnum.ADMIN}`)
            .emit('notification', {
                message: data.message,
                sender: user.username,
                timestamp: new Date()
            });

        // Also notify the sender that it was successful
        client.emit('notification_sent', { success: true, message: data.message });
    }

    @SubscribeMessage('events')
    handleEvent(@MessageBody() data: string, @ConnectedSocket() client: Socket): string {
        console.log('Received message from frontend:', data);
        return data;
    }

    @SubscribeMessage('message')
    handleMessage(@MessageBody() data: any): void {
        console.log('Message arrived:', data);
        this.server.emit('message', { serverReplies: 'Hello from server!', original: data });
    }
}
