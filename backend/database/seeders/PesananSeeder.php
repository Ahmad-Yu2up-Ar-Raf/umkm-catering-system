<?php

namespace Database\Seeders;

use App\Enums\StatusPesananEnum;
use App\Models\Paket;
use App\Models\Pesanan;
use App\Services\PesananService;
use Carbon\CarbonImmutable;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PesananSeeder extends Seeder
{
    use WithoutModelEvents;

    /** Orders generated per best-seller package (min..max). */
    private const BEST_SELLER_ORDERS = [30, 50];

    /** Orders generated per regular package (min..max). */
    private const REGULAR_ORDERS = [3, 10];

    /**
     * Seed realistic dummy orders. Every order goes through
     * PesananService::createOrder() so the money math holds by construction:
     * harga_paket_satuan is snapshotted from the paket, total_harga is
     * computed server-side and nomor_struk is daily-sequential.
     */
    public function run(PesananService $service): void
    {
        // Clean slate — re-running replaces, never stacks dummy orders.
        $cleared = Pesanan::query()->delete();
        $this->command?->warn("  cleared {$cleared} existing order(s)");

        $bestSellers = Paket::where('is_best_seller', true)->get();
        $this->command?->info('  seeding '.$bestSellers->count().' best-seller package(s)...');

        foreach ($bestSellers as $paket) {
            $this->seedOrders($service, $paket, self::BEST_SELLER_ORDERS);
        }

        $regular = Paket::where('is_best_seller', false)->get();
        $this->command?->info('  seeding '.$regular->count().' regular package(s)...');

        foreach ($regular as $paket) {
            $this->seedOrders($service, $paket, self::REGULAR_ORDERS);
        }

        $this->command?->info('  pesanan seeded: '.Pesanan::count().' order(s)');
    }

    /**
     * Create $range[0..1] random orders for one package, scattering the
     * transaction date over the last 6 months.
     */
    private function seedOrders(PesananService $service, Paket $paket, array $range): void
    {
        $count = fake()->numberBetween($range[0], $range[1]);

        for ($i = 0; $i < $count; $i++) {
            $pesanan = $service->createOrder($this->orderData($paket), $paket);

            // Order date scattered over 6 months; the struk date stays on the
            // recording day, matching how the admin enters orders.
            $saat = CarbonImmutable::now()->subMonths(6)
                ->addMinutes(fake()->numberBetween(0, 6 * 30 * 24 * 60));

            $pesanan->timestamps = false;
            $pesanan->created_at = $saat;
            $pesanan->updated_at = $saat;
            $pesanan->save();
        }
    }

    /**
     * A realistic order payload for the given package. total_harga,
     * nomor_struk and harga_paket_satuan are intentionally absent —
     * PesananService computes them server-side.
     *
     * @return array<string, mixed>
     */
    private function orderData(Paket $paket): array
    {
        $kapasitas = max($paket->min_order, $paket->kapasitas_produksi ?? $paket->min_order * 5);

        return [
            'nama_pemesan' => fake('id_ID')->name(),
            'no_telepon' => '08'.fake()->numerify('##########'),
            'paket_id' => $paket->id,
            'jumlah_paket' => fake()->numberBetween($paket->min_order, $kapasitas),
            'detail_tambahan' => fake()->randomElement([
                [],
                ['Extra sambal terasi'],
                ['Sendok & garpu tambahan'],
                ['Tambah nasi putih'],
                ['Air mineral botol'],
            ]),
            'biaya_tambahan' => fake()->randomElement([0, 0, 0, 5000, 10000, 15000, 25000]),
            'catatan' => fake()->boolean(30) ? fake('id_ID')->sentence() : null,
            'status_pesanan' => fake()->randomElement([
                StatusPesananEnum::Completed->value,
                StatusPesananEnum::Completed->value,
                StatusPesananEnum::Completed->value,
                StatusPesananEnum::Confirmed->value,
                StatusPesananEnum::Confirmed->value,
                StatusPesananEnum::Pending->value,
                StatusPesananEnum::Cancelled->value,
            ]),
        ];
    }
}
