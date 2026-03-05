package MorseEncoder;

use strict;
use warnings;
use MorseAlphabet;

# Encodes a plain English string into Morse code.
# Letters are joined by "||", words by "||||".
sub encode_line {
    my ($text) = @_;

    my @words = split /\s+/, $text;

    my @encoded_words;
    for my $word (@words) {
        my @letters = split //, $word;
        my $encoded = join '||', map {
            my $morse = MorseAlphabet::encode_char($_);
            die "No Morse encoding for character: '$_'\n" unless defined $morse;
            $morse;
        } @letters;
        push @encoded_words, $encoded;
    }

    return join '||||', @encoded_words;
}

1;
