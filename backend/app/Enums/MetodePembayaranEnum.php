<?php

namespace App\Enums;

enum MetodePembayaranEnum: string
{
    case Transfer = 'transfer';
    case Cash = 'cash';
    case Qris = 'qris';
}