'use server';
import React from 'react';
import {AdSpaceRenderer} from "@dsponsor/sdk";
// import '@dsponsor/sdk/dist/index.css';
import './index.css';
const CustomComponent = ({ data }) => {
    const renderNode = (node) => {
        const { style, childrens, sheet, textContent, href, target, className, onClick } = node;

        // Common props for all elements, including style and className
        const commonProps = {
            style,
            className,
            onClick: onClick ? () => onClick(node) : undefined // Wrap onClick in a function, if it exists
        };

        // If the node is a link, render an <a> tag with href and target
        if (href) {
            return (
                <a {...commonProps} href={href} target={target}>
                    {textContent}
                    {childrens.map(renderNode)}
                </a>
            );
        }

        // For div or generic container elements
        return (
            <div {...commonProps}>
                {textContent}
                {childrens.map(renderNode)}
            </div>
        );
    };

    return <>{data && renderNode(data)}</>;
};

const IframePage = async (req) => {
    const { offerId } = req.params;

    // let options = {
    //     type: 'responsive',
    // }

    // Object.keys(req.searchParams).forEach((type) => {
    //     switch (type) {
    //         case 'grid':
    //             options.type = 'grid';
    //             options.value = req.searchParams[type];
    //             break;
    //         case 'random':
    //             options.type = 'random';
    //             options.value = req.searchParams[type];
    //             break;
    //         default:
    //             options.type = type;
    //             options.value = req.searchParams[type];
    //             break;
    //     }
    // });
    //
    // let gridCols = 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8'; // Default responsive setting
    // let cellSize = 'w-20 h-20'; // Default cell size to 20x20
    // let gridRows = 'grid-rows-1'; // Default grid rows to 1
    // let totalCells = 8;
    //
    // if(options.type === 'random') {
    //     totalCells = options.value;
    // } else if(options.type === 'grid') {
    //     const [rows, cols] = options.value.split('x').map(Number);
    //     totalCells = rows * cols;
    //
    //     const cellWidth = `w-[calc((100% - ${cols - 1}rem) / ${cols})]`;
    //     gridCols = `grid-cols-${cols}`;
    //     gridRows = `grid-rows-${rows}`;
    //     cellSize = `${cellWidth} h-20`;
    // }

    const sponsoredItem = AdSpaceRenderer.fromOffer(offerId, {
        selector: 'dsponsor',
    })

    await sponsoredItem.preload();
    const options = {
        "theme": 'blue'
    };
    const container = sponsoredItem.render(options);


    return (
            <CustomComponent data={container} />
    );
};

export default IframePage;
