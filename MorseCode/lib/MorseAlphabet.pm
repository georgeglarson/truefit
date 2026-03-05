package MorseAlphabet;

use strict;
use warnings;

# Lookup table: Morse code → character.
# Source: International Morse Code (ITU-R M.1677-1).
my %DECODE = (
    '.-'    => 'A',  '-...'  => 'B',  '-.-.'  => 'C',  '-..'   => 'D',
    '.'     => 'E',  '..-.'  => 'F',  '--.'   => 'G',  '....'  => 'H',
    '..'    => 'I',  '.---'  => 'J',  '-.-'   => 'K',  '.-..'  => 'L',
    '--'    => 'M',  '-.'    => 'N',  '---'   => 'O',  '.--.'  => 'P',
    '--.-'  => 'Q',  '.-.'   => 'R',  '...'   => 'S',  '-'     => 'T',
    '..-'   => 'U',  '...-'  => 'V',  '.--'   => 'W',  '-..-'  => 'X',
    '-.--'  => 'Y',  '--..'  => 'Z',

    '-----' => '0',  '.----' => '1',  '..---' => '2',  '...--' => '3',
    '....-' => '4',  '.....' => '5',  '-....' => '6',  '--...' => '7',
    '---..' => '8',  '----.' => '9',
);

# Reverse table: character → Morse code (useful for testing / encoding).
my %ENCODE = reverse %DECODE;

sub decode_char {
    my ($morse) = @_;
    return $DECODE{$morse};
}

sub encode_char {
    my ($char) = @_;
    return $ENCODE{uc $char};
}

sub alphabet { return {%DECODE} }

1;
