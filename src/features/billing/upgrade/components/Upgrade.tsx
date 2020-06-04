import * as React from 'react';
// import difference from 'lodash.difference';
import merge from 'lodash.merge';
import { useParams } from 'react-router-dom';

export default function Upgrade() {
    let { slug } = useParams();

    const object = {
      'a': [{ 'b': 2 }, { 'd': 4 }]
    };

    const other = {
      'a': [{ 'c': 3 }, { 'e': 5 }]
    };

    merge(object, other);
    // difference([2, 1], [2, 3]);

    return (
        <div>
            Upgrade 123!!{slug}
        </div>
    )
};
