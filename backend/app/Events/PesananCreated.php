<?php

namespace App\Events;

use App\Http\Resources\PesananResource;
use App\Models\Pesanan;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PesananCreated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Pesanan $pesanan) {}

    /**
     * Private admin channel — only authenticated dashboard users subscribe.
     */
    public function broadcastOn(): Channel
    {
        return new PrivateChannel('admin.pesanan');
    }

    public function broadcastAs(): string
    {
        return 'pesanan.created';
    }

    /**
     * Minimal payload via PesananResource to avoid leaking internals.
     */
    public function broadcastWith(): array
    {
        return (new PesananResource($this->pesanan->loadMissing('paket')))->toArray(request());
    }
}
