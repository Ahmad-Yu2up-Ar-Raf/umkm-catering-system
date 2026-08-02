<?php

namespace Database\Factories;

use App\Enums\StatusPesananEnum;
use App\Models\Paket;
use App\Models\Pesanan;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Pesanan>
 */
class PesananFactory extends Factory
{
    /**
     * The current model being faked.
     *
     * @var class-string<Pesanan>
     */
    protected $model = Pesanan::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $jumlahPaket = 10;
        $hargaSatuan = 25000;

        return [
            'nomor_struk' => 'STR-'.now()->format('Ymd').'-'
                .str_pad((string) fake()->unique()->numberBetween(1, 9999), 4, '0', STR_PAD_LEFT),
            'nama_pemesan' => fake()->name(),
            'no_telepon' => '08'.fake()->numerify('##########'),
            'paket_id' => Paket::factory(),
            'jumlah_paket' => $jumlahPaket,
            'harga_paket_satuan' => $hargaSatuan,
            'detail_tambahan' => ['Extra sambal', 'Sendok plastik'],
            'biaya_tambahan' => 0,
            'catatan' => fake()->sentence(),
            'total_harga' => $jumlahPaket * $hargaSatuan,
            'status_pesanan' => StatusPesananEnum::Pending->value,
        ];
    }
}
