<?php

declare(strict_types=1);

namespace App\Services;

use OpenSpout\Common\Entity\Row;
use OpenSpout\Common\Entity\Style\Border;
use OpenSpout\Common\Entity\Style\BorderPart;
use OpenSpout\Common\Entity\Style\CellAlignment;
use OpenSpout\Common\Entity\Style\Color;
use OpenSpout\Common\Entity\Style\Style;
use OpenSpout\Writer\XLSX\Options;
use OpenSpout\Writer\XLSX\Writer;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExcelExportService
{
    private const BORDER_GRAY = 'CBD5E1';
    private const HEADER_FILL = '0F172A';

    /**
     * Stream an XLSX download with O(1) memory via cursor.
     * Layout: Row 1 column headers, Row 2+ data (no title banner — exports
     * start directly with the data table by product decision).
     */
    public static function stream(
        string $filename,
        array $headers,
        iterable $rows,
        ?array $columnWidths = null
    ): StreamedResponse {
        return response()->streamDownload(function () use ($headers, $rows, $columnWidths) {
            $options = new Options();
            // BUG-1 fix: no hardcoded DEFAULT_ROW_HEIGHT on data rows — height
            // is computed per-row from max "\n" count so orderedList() never clips.
            // Header height remains explicit via Row::setHeight(); data rows
            // get dynamic height below. Leaving DEFAULT_ROW_HEIGHT null lets
            // Excel auto-fit wrapped text unless we set a custom height.
            if ($columnWidths !== null) {
                foreach ($columnWidths as $idx => $w) {
                    $col = isset($columnWidths[0]) ? $idx + 1 : (int) $idx;
                    $options->setColumnWidth((float) $w, $col);
                }
            } else {
                $options->DEFAULT_COLUMN_WIDTH = 18;
            }

            $writer = new Writer($options);
            $writer->openToFile('php://output');

            $thinGray = new Border(
                new BorderPart(Border::BOTTOM, self::BORDER_GRAY, Border::WIDTH_THIN, Border::STYLE_SOLID),
                new BorderPart(Border::TOP, self::BORDER_GRAY, Border::WIDTH_THIN, Border::STYLE_SOLID),
                new BorderPart(Border::LEFT, self::BORDER_GRAY, Border::WIDTH_THIN, Border::STYLE_SOLID),
                new BorderPart(Border::RIGHT, self::BORDER_GRAY, Border::WIDTH_THIN, Border::STYLE_SOLID)
            );

            // Header: bold white on dark slate #0F172A, centered, wrapped, bordered
            $headerStyle = (new Style())
                ->setFontBold()
                ->setFontSize(11)
                ->setFontColor(Color::WHITE)
                ->setBackgroundColor(self::HEADER_FILL)
                ->setCellAlignment(CellAlignment::CENTER)
                ->setShouldWrapText(true)
                ->setBorder(new Border(
                    new BorderPart(Border::BOTTOM, Color::BLACK, Border::WIDTH_THIN, Border::STYLE_SOLID),
                    new BorderPart(Border::TOP, Color::BLACK, Border::WIDTH_THIN, Border::STYLE_SOLID),
                    new BorderPart(Border::LEFT, Color::BLACK, Border::WIDTH_THIN, Border::STYLE_SOLID),
                    new BorderPart(Border::RIGHT, Color::BLACK, Border::WIDTH_THIN, Border::STYLE_SOLID)
                ));

            $writer->addRow(Row::fromValues($headers, $headerStyle));

            // Data rows: 10pt, wrap, thin gray borders
            $dataStyle = (new Style())
                ->setFontSize(10)
                ->setShouldWrapText(true)
                ->setBorder($thinGray);

            foreach ($rows as $values) {
                $row = Row::fromValues($values, $dataStyle);
                // Dynamic height: 18pt per line, floor 20pt so single-line rows are padded
                $maxLines = 1;
                foreach ($values as $cellValue) {
                    if (is_string($cellValue)) {
                        $lines = substr_count($cellValue, "\n") + 1;
                        if ($lines > $maxLines) $maxLines = $lines;
                    }
                }
                $row->setHeight(max(20, $maxLines * 18));
                $writer->addRow($row);
            }

            $writer->close();
        }, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Cache-Control' => 'no-store',
        ]);
    }

    public static function filename(string $module): string
    {
        return sprintf('%s-export-%s.xlsx', $module, now()->format('Ymd-His'));
    }

    /** Generic "N/A" fallback for empty values. */
    public static function na(mixed $value): string
    {
        if (is_null($value)) return 'N/A';
        if (is_string($value) && trim($value) === '') return 'N/A';
        if (is_array($value) && count($value) === 0) return 'N/A';
        return (string) $value;
    }

    public static function text(mixed $value): string
    {
        if (is_null($value)) return 'N/A';
        $s = is_array($value) ? implode('; ', array_map(fn ($v) => (string) $v, $value)) : trim((string) $value);
        return $s === '' ? 'N/A' : $s;
    }

    public static function join(mixed $value): string
    {
        if (is_null($value) || $value === '') return 'N/A';
        if (is_array($value)) {
            $filtered = array_filter(array_map(fn ($v) => trim((string) $v), $value), fn ($v) => $v !== '');
            if (count($filtered) === 0) return 'N/A';
            return implode('; ', $filtered);
        }
        $s = trim((string) $value);
        return $s === '' ? 'N/A' : $s;
    }

    /** Numbered ordered list: "1. Nasi Goreng\n2. Ayam Bakar" (wrap enabled on data rows). */
    public static function orderedList(mixed $value): string
    {
        if (is_null($value) || $value === '') return 'N/A';
        $items = is_array($value)
            ? array_values(array_filter(array_map(fn ($v) => trim((string) $v), $value), fn ($v) => $v !== ''))
            : [trim((string) $value)];
        if (count($items) === 0) return 'N/A';
        if (count($items) === 1) return $items[0];
        return implode("\n", array_map(fn ($i, $v) => ($i + 1).'. '.$v, array_keys($items), $items));
    }

    public static function boolLabel(mixed $value): string
    {
        if (is_null($value) || $value === '') return 'N/A';
        return $value ? 'Ya' : 'Tidak';
    }

    public static function idr(mixed $value): string
    {
        if (is_null($value) || $value === '') return 'N/A';
        $num = (float) $value;
        return 'Rp '.number_format($num, 0, ',', '.');
    }

    /** Alias per directive naming. */
    public static function formatCurrency(mixed $value): string
    {
        return self::idr($value);
    }

    public static function statusLabel(mixed $value): string
    {
        $s = trim((string) ($value instanceof \BackedEnum ? $value->value : $value));
        if ($s === '') return 'N/A';
        $map = [
            'pending' => 'Pending',
            'confirmed' => 'Dikonfirmasi',
            'completed' => 'Selesai',
            'cancelled' => 'Dibatalkan',
            'public' => 'Publik',
            'private' => 'Privat',
            'hidden' => 'Tersembunyi',
        ];
        return $map[strtolower($s)] ?? ucfirst($s);
    }

    /** Alias per directive naming. */
    public static function formatStatus(mixed $value): string
    {
        return self::statusLabel($value);
    }

    public static function date(mixed $value): string
    {
        if (is_null($value) || $value === '') return 'N/A';
        try {
            return \Carbon\Carbon::parse($value)->format('Y-m-d');
        } catch (\Throwable $e) {
            return (string) $value;
        }
    }

    public static function datetime(mixed $value): string
    {
        if (is_null($value) || $value === '') return 'N/A';
        try {
            return \Carbon\Carbon::parse($value)->format('Y-m-d H:i:s');
        } catch (\Throwable $e) {
            return (string) $value;
        }
    }
}
