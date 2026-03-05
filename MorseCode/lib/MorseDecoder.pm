package MorseDecoder;

use strict;
use warnings;
use MorseAlphabet;

# Decodes a single Morse-encoded line into English text.
# Delimiter scheme: "||" separates letters, "||||" separates words.
sub decode_line {
    my ($line) = @_;

    # Split on word boundaries first (||||), then letter boundaries (||).
    my @words = split /\|\|\|\|/, $line;

    my @decoded_words;
    for my $word (@words) {
        my @letters = split /\|\|/, $word;
        my $decoded = join '', map {
            my $char = MorseAlphabet::decode_char($_);
            die "Unknown Morse sequence: '$_'\n" unless defined $char;
            $char;
        } @letters;
        push @decoded_words, $decoded;
    }

    return lc join ' ', @decoded_words;
}

1;
