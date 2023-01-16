const Product = require("../models/product")


const getAllProductsStatic = async (req, res) => {
    const { featured, company, name, sort, fields, page, limit, numericFilters } = req.query
    const queryObject = {}

    if (featured) {
        queryObject.featured = featured === "true" ? true : false
    }
    if (company) {
        queryObject.company = company
    }
    if (name) {
        queryObject.name = { $regex: name, $options: 'i' }
    }

    if (numericFilters) {
        const operatorMap = {
            ">": "$gt",
            ">=": "$gte",
            "=": "$eq",
            "<": "$lt",
            "<=": "$lte",
        }
        const regEx = /\b(<|>|>=|=|<|<=)\b/g
        let filters = numericFilters.replace(regEx, (match) => `-${operatorMap[match]}-`)
        const options = ["price", "rating"]
        filters = filters.split(",").forEach((item) => {
            const [field, operator, value] = item.split("-")
            if (options.includes(field)) {
                queryObject[field] = { [operator]: Number(value) }
            }
        })
        console.log(filters);
    }

    console.log(queryObject);
    let result = Product.find(queryObject)

    //sort
    if (sort) {
        const sortList = sort.split(",").join(" ")
        result = result.sort(sortList)
    } else {
        result = result.sort("createdAt")
    }

    if (fields) {
        const fieldsList = fields.split(",").join(" ")
        result = result.select(fieldsList)
    }

    const pageNumber = Number(page) || 1
    const limitPerPage = Number(limit) || 10
    const skip = (pageNumber - 1) * limit

    result = result.skip(skip).limit(limitPerPage)

    const products = await result
    res.status(200).json({ products, nbHits: products.length })
}

const getAllProducts = async (req, res) => {
    const products = await Product.find({ name: { $regex: req.query.name } })
    res.status(200).json({ products, nbHits: products.length })
}

module.exports = {
    getAllProducts,
    getAllProductsStatic
}