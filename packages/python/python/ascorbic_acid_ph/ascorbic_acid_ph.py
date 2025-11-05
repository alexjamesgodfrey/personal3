#!/usr/bin/env python3
"""
Calculate the pH/acidity of ascorbic acid (Vitamin C) dissolved in water.

Usage:
    python ascorbic_acid_ph.py <mg_ascorbic_acid> <oz_water>
    python ascorbic_acid_ph.py 100 8
"""

import sys
import numpy as np


# Constants
ASCORBIC_ACID_MW = 176.12  # g/mol - molecular weight
KA1 = 8e-5  # First dissociation constant
OZ_TO_ML = 29.57  # 1 oz = 29.57 mL
ML_TO_L = 1000  # 1000 mL = 1 L


def calculate_ph(mg_ascorbic_acid: float, oz_water: float) -> dict:
    """
    Calculate the pH of ascorbic acid solution.
    
    Args:
        mg_ascorbic_acid: Amount of ascorbic acid in milligrams
        oz_water: Volume of water in fluid ounces
    
    Returns:
        Dictionary containing calculation results
    """
    # Convert mg to moles
    moles_ascorbic_acid = (mg_ascorbic_acid / 1000) / ASCORBIC_ACID_MW
    
    # Convert oz to liters
    volume_liters = (oz_water * OZ_TO_ML) / ML_TO_L
    
    # Calculate molarity
    molarity = moles_ascorbic_acid / volume_liters
    
    # Calculate hydrogen ion concentration using weak acid approximation
    # [H+] ≈ √(Ka × M)
    h_plus_concentration = np.sqrt(KA1 * molarity)
    
    # Calculate pH
    ph = -np.log10(h_plus_concentration)
    
    return {
        'mg_ascorbic_acid': mg_ascorbic_acid,
        'oz_water': oz_water,
        'moles_ascorbic_acid': moles_ascorbic_acid,
        'volume_liters': volume_liters,
        'molarity': molarity,
        'h_plus_concentration': h_plus_concentration,
        'ph': ph
    }


def print_results(results: dict):
    """Pretty print the calculation results."""
    print("\n" + "="*60)
    print("ASCORBIC ACID pH CALCULATOR")
    print("="*60)
    print(f"\nInput:")
    print(f"  Ascorbic Acid: {results['mg_ascorbic_acid']:.2f} mg")
    print(f"  Water Volume:  {results['oz_water']:.2f} oz")
    print(f"\nCalculations:")
    print(f"  Moles of Ascorbic Acid: {results['moles_ascorbic_acid']:.6e} mol")
    print(f"  Solution Volume:        {results['volume_liters']:.4f} L")
    print(f"  Molarity:               {results['molarity']:.6f} M")
    print(f"  H+ Concentration:       {results['h_plus_concentration']:.6e} M")
    print(f"\n{'⚗️  RESULT:':<20} pH = {results['ph']:.2f}")
    
    # Add acidity interpretation
    ph = results['ph']
    if ph < 3:
        acidity = "Very Acidic"
    elif ph < 5:
        acidity = "Acidic"
    elif ph < 6:
        acidity = "Mildly Acidic"
    elif ph < 8:
        acidity = "Neutral"
    else:
        acidity = "Basic"
    
    print(f"{'   Acidity:':<20} {acidity}")
    print("="*60 + "\n")


def main():
    """Main entry point for the script."""
    if len(sys.argv) != 3:
        print(__doc__)
        print("\nExample: Calculate pH of 100mg ascorbic acid in 8 oz water")
        print("  python ascorbic_acid_ph.py 100 8")
        sys.exit(1)
    
    try:
        mg_ascorbic_acid = float(sys.argv[1])
        oz_water = float(sys.argv[2])
        
        if mg_ascorbic_acid <= 0 or oz_water <= 0:
            raise ValueError("Values must be positive")
        
        results = calculate_ph(mg_ascorbic_acid, oz_water)
        print_results(results)
        
    except ValueError as e:
        print(f"Error: Invalid input - {e}")
        print("Please provide positive numbers for mg and oz")
        sys.exit(1)


if __name__ == "__main__":
    main()