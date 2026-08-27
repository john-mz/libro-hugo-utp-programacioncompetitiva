#include <iostream>
#include <cmath>
using namespace std;

signed long long int formulaCuadraticaInicial(signed long long int n){
    double k = (-1 + sqrt(1+8*n))/2;
    return ceil(k);
}

signed long long int formulaCuadraticaFinal(signed long long int n){
    double k = (-1 + sqrt(1+8*n))/2;
    return floor(k);
}

signed long long int conteo(signed long long int kf, signed long long int ko){
    return kf - ko + 1;
}

int main()
{
    signed long long int a, b, k_inicial, k_final;
    while(cin >> a >> b && a > 0 && b > 0){
        signed long long int a_ = formulaCuadraticaInicial(a);
        signed long long int b_ = formulaCuadraticaFinal(b);
        if (a_ > b_){
            cout << 0 << "\n";
        }else{
            cout << conteo(b_, a_) << "\n";
        }
    }

    return 0;
}
