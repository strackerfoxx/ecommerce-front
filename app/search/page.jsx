"use client"
import { useState, useEffect } from "react"
import { useProduct } from "../hooks/useProduct"
import { useCart } from "../hooks/useCart"
import { useUser } from "../hooks/useUser"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import "../css/search.css"

import Image from "next/image"

export default function Search() {
  const [productsFiltred, setProductsFiltred] = useState([])
  const [paramProducts, setParamProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [router, setRouter] = useState(null)  // Nuevo estado para los parámetros de búsqueda

  const { products, handleFavorite } = useProduct();
  const { favoriteList } = useUser()
  const { addProduct } = useCart()

  // Usar useEffect para asegurarse de que se ejecute solo en el cliente
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    setRouter(searchParams.get("param"));
  }, []); // Solo se ejecuta una vez después del primer renderizado en el cliente

  useEffect(() => {
    const productsState = []
    const categoriesState = []
    const brandsState = []

    if (!router) {
      setProductsFiltred(products); 
      setParamProducts(products); 
      products.forEach(product => {
        if (!categoriesState.includes(product.category)) categoriesState.push(product.category)
        if (!brandsState.includes(product.brand)) brandsState.push(product.brand)
      })
      setCategories(categoriesState)
      setBrands(brandsState)
      return
    }

    const routerSeparated = router.toLowerCase().split(" ")

    products.forEach(product => {
      const nameSeparated = product.name.toLowerCase().split(" ")
      const categorySeparated = product.category.toLowerCase().split(" ")
      const brandSeparated = product.brand.toLowerCase().split(" ")

      if (!routerSeparated || routerSeparated.length === 0) return
      if (nameSeparated.includes(routerSeparated[0]) || categorySeparated.includes(routerSeparated[0]) || brandSeparated.includes(routerSeparated[0])) {
        productsState.push(product)
      }
    })

    productsState.forEach(product => {
      if (!categoriesState.includes(product.category)) categoriesState.push(product.category)
      if (!brandsState.includes(product.brand)) brandsState.push(product.brand)
    })

    if (!routerSeparated || routerSeparated.length === 0) return setProductsFiltred(products)
    setProductsFiltred(productsState)
    setParamProducts(productsState)
    setCategories(categoriesState)
    setBrands(brandsState)

  }, [products, router]);

  const handleOrderBy = (e) => {
    const order = e.target.value

    if (order === "") setProductsFiltred(paramProducts)
    if (order === "desc") setProductsFiltred(productsFiltred.slice().sort((a, b) => b.price - a.price))
    if (order === "asc") setProductsFiltred(productsFiltred.slice().sort((a, b) => a.price - b.price))
  }

  const handleCategory = (e) => {
    const productsState = []

    if (e.target.value === "all") return setProductsFiltred(paramProducts)

    paramProducts.forEach(product => {
      if (product.category === e.target.value) productsState.push(product)
    })
  
    setProductsFiltred(productsState)
  }

  const handleBrand = (e) => {
    const productsState = []

    if (e.target.value === "all") return setProductsFiltred(paramProducts)

    paramProducts.forEach(product => {
      if (product.brand === e.target.value) productsState.push(product)
    })

    setProductsFiltred(productsState)
  }

  const handleCartClick = (product) => {
    let color = product.colors[0]
    if (!color) return addProduct(product)
    addProduct(product, color)
  };

  const handleHeartClick = (product) => {
    handleFavorite(product)
  };

  return (
    <div id="search-container">
      <aside>
        <select name="orderby" id="orderby" onChange={handleOrderBy}>
          <option value="">Order By</option>
          <option value="asc">Price: Low to High</option>
          <option value="desc">Price: High to Low</option>
        </select>
        <select name="category" id="category" onChange={handleCategory}>
          <option value="all">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        <select name="brand" id="brand" onChange={handleBrand}>
          <option value="all">All Brands</option>
          {brands.map((brand) => (
            <option key={brand} value={brand}>{brand}</option>
          ))}
        </select>
      </aside>
      <div id="products-container">
        <div className="products-list center">{productsFiltred.map(product => (
          <div className="product" key={product._id}>
            <div className="image-container">
                    <Link href={`/product/${product._id}`} className='link' id='image-link'>
                        <Image className="clickeable" src={product.images[0]} alt={product.description} width={"500"} height={"250"} />
                    </Link>
                    <svg xmlns="http://www.w3.org/2000/svg" fill={favoriteList?.some(productState => productState._id === product._id) ? "#da0b5b" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} className="heart-svg" onClick={() => handleHeartClick(product)} />
                </div>
            <Link href={`/product/${product._id}`} className='link'>
              <h3 className="clickeable">{product.name}</h3>
            </Link>
            <p>price: </p>

            <div className="price-stock">
              <p><span>${product.price}</span></p>
              <button className="cart-btn" onClick={() => handleCartClick(product)} />
            </div>
          </div>
        ))}</div>
      </div>
    </div>
  )
}
